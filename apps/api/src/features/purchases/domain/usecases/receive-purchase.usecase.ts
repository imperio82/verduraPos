import { BusinessRuleError, NotFoundError, roundMoney, roundQuantity, salePriceFromCost } from '@/core';
import type { ProductRepository } from '@/features/products/domain/repositories/product.repository';
import {
  goodQuantity,
  type PurchaseEntity,
  type PurchaseItem,
  type PurchaseItemStatus,
} from '../entities/purchase.entity';
import type { PurchaseRepository } from '../repositories/purchase.repository';

export interface ReceivePurchaseInput {
  numeroFactura?: string;
  fechaFactura?: Date;
  nota?: string;
  items: {
    productId: string;
    estado: PurchaseItemStatus;
    cantidadRecibida: number;
    cantidadMala?: number;
    /** Si el precio de la factura cambió respecto a la compra. */
    precioCompra?: number;
  }[];
}

/**
 * Revisión de la llegada: por cada producto se marca si llegó bien, si faltó o
 * si llegó malo. Solo lo que llegó en buen estado entra al stock, y los
 * productos recibidos quedan con el costo y precio de venta de esta compra.
 */
export class ReceivePurchaseUseCase {
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(purchaseId: string, input: ReceivePurchaseInput): Promise<PurchaseEntity> {
    const purchase = await this.purchaseRepository.findById(purchaseId);
    if (!purchase) throw new NotFoundError('Compra no encontrada');
    if (purchase.estado !== 'por_llegar') {
      throw new BusinessRuleError(`La compra ${purchase.codigo} ya está ${purchase.estado}`);
    }

    const checks = new Map(input.items.map((item) => [item.productId, item]));
    const items: PurchaseItem[] = purchase.items.map((item) => {
      const check = checks.get(item.productId);
      const estado = check?.estado ?? 'falto';
      // "Faltó" puede ser parcial: se registra lo que sí llegó.
      const cantidadRecibida = roundQuantity(check?.cantidadRecibida ?? 0);
      const cantidadMala = estado === 'malo' ? roundQuantity(Math.min(check?.cantidadMala ?? cantidadRecibida, cantidadRecibida)) : 0;
      const precioCompra = roundMoney(check?.precioCompra ?? item.precioCompra);
      return {
        ...item,
        precioCompra,
        precioVenta: salePriceFromCost(precioCompra, item.porcentajeGanancia),
        cantidadRecibida,
        cantidadMala,
        estado,
      };
    });

    // Primero se marca como recibida: si dos personas revisan a la vez, solo una suma al stock.
    const received = await this.purchaseRepository.markReceived(purchase.id, {
      items,
      totalRecibido: roundMoney(items.reduce((sum, item) => sum + goodQuantity(item) * item.precioCompra, 0)),
      numeroFactura: input.numeroFactura?.trim() || purchase.numeroFactura,
      fechaFactura: input.fechaFactura ?? purchase.fechaFactura,
      notaLlegada: input.nota?.trim() || undefined,
    });
    if (!received) throw new BusinessRuleError(`La compra ${purchase.codigo} ya fue revisada`);

    await Promise.all(
      items
        .filter((item) => (item.cantidadRecibida ?? 0) > 0)
        .flatMap((item) => [
          this.productRepository.adjustStock(item.productId, goodQuantity(item)),
          this.productRepository.updatePricing(item.productId, {
            precioCompra: item.precioCompra,
            porcentajeGanancia: item.porcentajeGanancia,
            precioVenta: item.precioVenta,
          }),
        ]),
    );

    return received;
  }
}
