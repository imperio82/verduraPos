import { NotFoundError, roundMoney, roundQuantity, ValidationError } from '@/core';
import type { PaymentMethod } from '@/core/constants/collections';
import type { CashSessionGuard } from '@/features/cash-registers/domain/usecases/cash-session.guard';
import type { ProductRepository } from '@/features/products/domain/repositories/product.repository';
import type { SaleEntity, SaleItem, SaleType } from '../entities/sale.entity';
import type { SaleRepository } from '../repositories/sale.repository';

export interface CreateSaleInput {
  cashSessionId: string;
  tipo: SaleType;
  metodoPago: PaymentMethod;
  /** Para ventas por producto: solo producto y cantidad; el precio lo pone el sistema. */
  items?: { productId: string; cantidad: number }[];
  /** Para "venta total": el valor cobrado. */
  total?: number;
  descuento?: number;
  nota?: string;
}

export class CreateSaleUseCase {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly productRepository: ProductRepository,
    private readonly cashSessionGuard: CashSessionGuard,
  ) {}

  async execute(input: CreateSaleInput): Promise<SaleEntity> {
    const session = await this.cashSessionGuard.ensureOpen(input.cashSessionId);

    const items = input.tipo === 'productos' ? await this.buildItems(input.items ?? []) : [];
    const subtotal = input.tipo === 'productos' ? items.reduce((sum, item) => sum + item.total, 0) : roundMoney(input.total ?? 0);
    const descuento = roundMoney(input.descuento ?? 0);

    if (subtotal <= 0) throw new ValidationError('La venta debe tener un valor mayor a cero', 'total');
    if (descuento < 0 || descuento > subtotal) throw new ValidationError('Descuento inválido', 'descuento');

    const sale = await this.saleRepository.create({
      cashSessionId: session.id,
      cajaNombre: session.cajaNombre,
      cajero: session.cajero,
      tipo: input.tipo,
      items,
      subtotal,
      descuento,
      total: subtotal - descuento,
      metodoPago: input.metodoPago,
      nota: input.nota?.trim() || undefined,
    });

    // La fruta se vende aunque el sistema diga que no hay: el reconteo corrige.
    await Promise.all(items.map((item) => this.productRepository.adjustStock(item.productId, -item.cantidad)));

    return sale;
  }

  private async buildItems(lines: { productId: string; cantidad: number }[]): Promise<SaleItem[]> {
    if (lines.length === 0) throw new ValidationError('Agrega al menos un producto', 'items');

    const products = await this.productRepository.findByIds(lines.map((line) => line.productId));
    const byId = new Map(products.map((product) => [product.id, product]));

    return lines.map((line) => {
      const product = byId.get(line.productId);
      if (!product) throw new NotFoundError('Producto no encontrado', 'items');
      const cantidad = roundQuantity(line.cantidad);
      if (cantidad <= 0) throw new ValidationError(`Cantidad inválida para ${product.nombre}`, 'items');
      return {
        productId: product.id,
        nombre: product.nombre,
        unidad: product.unidad,
        cantidad,
        precioUnitario: product.precioVenta,
        total: roundMoney(cantidad * product.precioVenta),
      };
    });
  }
}
