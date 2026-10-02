import { NotFoundError, roundMoney, roundQuantity, salePriceFromCost, ValidationError } from '@/core';
import type { ProductRepository } from '@/features/products/domain/repositories/product.repository';
import type { SupplierRepository } from '@/features/suppliers/domain/repositories/supplier.repository';
import { purchaseTotal, type PurchaseEntity, type PurchaseItem } from '../entities/purchase.entity';
import type { PurchaseRepository } from '../repositories/purchase.repository';

export interface CreatePurchaseInput {
  supplierId: string;
  numeroFactura?: string;
  fechaFactura?: Date;
  /** Si no se indica, se espera para hoy. */
  fechaEntrega?: Date;
  /** % de ganancia que se aplica a los productos sin % propio. */
  porcentajeGananciaGeneral: number;
  items: {
    productId: string;
    cantidad: number;
    /** Si no se indica, se toma el último precio de compra del producto. */
    precioCompra?: number;
    porcentajeGanancia?: number;
  }[];
  nota?: string;
}

/**
 * Registra una compra "por llegar": calcula precios de venta, pero no toca el
 * stock ni los precios del producto hasta que se revise la llegada.
 */
export class CreatePurchaseUseCase {
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    private readonly productRepository: ProductRepository,
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(input: CreatePurchaseInput): Promise<PurchaseEntity> {
    const supplier = await this.supplierRepository.findById(input.supplierId);
    if (!supplier) throw new NotFoundError('Proveedor no encontrado', 'supplierId');

    const lines = input.items.filter((line) => line.cantidad > 0);
    if (lines.length === 0) throw new ValidationError('La compra no tiene productos', 'items');

    const products = await this.productRepository.findByIds(lines.map((l) => l.productId));
    const byId = new Map(products.map((p) => [p.id, p]));

    const items: PurchaseItem[] = lines.map((line) => {
      const product = byId.get(line.productId);
      if (!product) throw new NotFoundError('Producto no encontrado', 'items');
      const precioCompra = roundMoney(line.precioCompra ?? product.precioCompra);
      const porcentajeGanancia = line.porcentajeGanancia ?? input.porcentajeGananciaGeneral;
      const cantidad = roundQuantity(line.cantidad);
      return {
        productId: product.id,
        nombre: product.nombre,
        unidad: product.unidad,
        cantidad,
        precioCompra,
        porcentajeGanancia,
        precioVenta: salePriceFromCost(precioCompra, porcentajeGanancia),
        subtotal: roundMoney(cantidad * precioCompra),
      };
    });

    return this.purchaseRepository.create({
      supplierId: supplier.id,
      proveedorNombre: supplier.nombre,
      numeroFactura: input.numeroFactura?.trim() || undefined,
      fechaFactura: input.fechaFactura,
      fechaEntrega: input.fechaEntrega ?? new Date(),
      porcentajeGananciaGeneral: input.porcentajeGananciaGeneral,
      items,
      total: purchaseTotal(items),
      nota: input.nota?.trim() || undefined,
    });
  }
}
