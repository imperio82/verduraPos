import { dayKey, NotFoundError, roundMoney, roundQuantity, ValidationError, type DateRange } from '@/core';
import type { ProductUnit } from '@/features/products/domain/entities/product.entity';
import type { CashSessionGuard } from '@/features/cash-registers/domain/usecases/cash-session.guard';
import type { ProductRepository } from '@/features/products/domain/repositories/product.repository';
import type { DamageEntity, DamageSummary, RecountEntity, RecountItem } from '../entities/inventory.entity';
import type { InventoryRepository } from '../repositories/inventory.repository';

export interface RegisterRecountInput {
  items: { productId: string; contado: number }[];
  nota?: string;
  /** Si no se indica, se liga a la última caja abierta. */
  cashSessionId?: string;
}

/**
 * La fruta es difícil de inventariar: el reconteo deja registrado cuánto decía
 * el sistema, cuánto se contó y la diferencia, y ajusta el stock a lo contado.
 */
export class RegisterRecountUseCase {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly cashSessionGuard: CashSessionGuard,
  ) {}

  async execute(input: RegisterRecountInput): Promise<RecountEntity> {
    if (input.items.length === 0) throw new ValidationError('Cuenta al menos un producto', 'items');
    const session = await this.cashSessionGuard.resolveOpen(input.cashSessionId);

    const products = await this.productRepository.findByIds(input.items.map((i) => i.productId));
    const byId = new Map(products.map((p) => [p.id, p]));

    const items: RecountItem[] = input.items.map((line) => {
      const product = byId.get(line.productId);
      if (!product) throw new NotFoundError('Producto no encontrado', 'items');
      const contado = roundQuantity(line.contado);
      return {
        productId: product.id,
        nombre: product.nombre,
        unidad: product.unidad,
        sistema: product.stock,
        contado,
        diferencia: roundQuantity(contado - product.stock),
      };
    });

    const recount = await this.inventoryRepository.createRecount({
      items,
      nota: input.nota?.trim() || undefined,
      cashSessionId: session.id,
    });
    await Promise.all(items.map((item) => this.productRepository.setStock(item.productId, item.contado)));
    return recount;
  }
}

export class GetLastRecountUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  execute(): Promise<RecountEntity | null> {
    return this.inventoryRepository.findLastRecount();
  }
}

export interface RegisterDamageInput {
  productId: string;
  cantidad: number;
  motivo?: string;
  /** Si no se indica, se liga a la última caja abierta. */
  cashSessionId?: string;
}

export class RegisterDamageUseCase {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly cashSessionGuard: CashSessionGuard,
  ) {}

  async execute(input: RegisterDamageInput): Promise<DamageEntity> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) throw new NotFoundError('Producto no encontrado', 'productId');

    const cantidad = roundQuantity(input.cantidad);
    if (cantidad <= 0) throw new ValidationError('La cantidad debe ser mayor a cero', 'cantidad');
    const session = await this.cashSessionGuard.resolveOpen(input.cashSessionId);

    const damage = await this.inventoryRepository.createDamage({
      productId: product.id,
      nombre: product.nombre,
      unidad: product.unidad,
      cantidad,
      costo: roundMoney(cantidad * product.precioCompra),
      motivo: input.motivo?.trim() || undefined,
      cashSessionId: session.id,
    });
    await this.productRepository.adjustStock(product.id, -cantidad);
    return damage;
  }
}

export class GetDamageSummaryUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(range: DateRange): Promise<DamageSummary> {
    const items = await this.inventoryRepository.findDamages(range);
    const cantidadPorUnidad: Partial<Record<ProductUnit, number>> = {};
    for (const item of items) {
      cantidadPorUnidad[item.unidad] = roundQuantity((cantidadPorUnidad[item.unidad] ?? 0) + item.cantidad);
    }
    return {
      desde: dayKey(range.from),
      hasta: dayKey(range.to),
      cantidadPorUnidad,
      costoTotal: items.reduce((sum, item) => sum + item.costo, 0),
      items,
    };
  }
}
