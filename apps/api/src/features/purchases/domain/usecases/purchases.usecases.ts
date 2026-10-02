import { BusinessRuleError, NotFoundError } from '@/core';
import type { PurchaseEntity } from '../entities/purchase.entity';
import type { PurchaseFilters, PurchaseRepository } from '../repositories/purchase.repository';

export class GetPurchasesUseCase {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  execute(filters: PurchaseFilters): Promise<PurchaseEntity[]> {
    return this.purchaseRepository.findAll(filters);
  }
}

export class GetPurchaseByIdUseCase {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  async execute(id: string): Promise<PurchaseEntity> {
    const purchase = await this.purchaseRepository.findById(id);
    if (!purchase) throw new NotFoundError('Compra no encontrada');
    return purchase;
  }
}

/**
 * Última compra al proveedor: sirve para precargar una nueva compra con lo que
 * normalmente se le pide y sus últimos precios (ahorra pasos).
 */
export class GetLastSupplierPurchaseUseCase {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  execute(supplierId: string): Promise<PurchaseEntity | null> {
    return this.purchaseRepository.findLastBySupplier(supplierId);
  }
}

/** Una compra que no va a llegar. Solo mientras está "por llegar": no toca el stock. */
export class CancelPurchaseUseCase {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  async execute(id: string): Promise<PurchaseEntity> {
    const purchase = await this.purchaseRepository.findById(id);
    if (!purchase) throw new NotFoundError('Compra no encontrada');
    const cancelled = await this.purchaseRepository.cancel(id);
    if (!cancelled) throw new BusinessRuleError(`La compra ${purchase.codigo} ya está ${purchase.estado}`);
    return cancelled;
  }
}
