import type { DateRange } from '@/core';
import type {
  NewPurchase,
  PurchaseEntity,
  PurchaseStatus,
  ReceivedPurchaseData,
} from '../entities/purchase.entity';

export interface PurchaseFilters extends Partial<DateRange> {
  supplierId?: string;
  estado?: PurchaseStatus;
}

export interface PurchaseRepository {
  /** Asigna el código consecutivo (C-001...) y guarda la compra "por llegar". */
  create(purchase: NewPurchase): Promise<PurchaseEntity>;
  findAll(filters: PurchaseFilters): Promise<PurchaseEntity[]>;
  findById(id: string): Promise<PurchaseEntity | null>;
  /** Última compra no cancelada al proveedor. */
  findLastBySupplier(supplierId: string): Promise<PurchaseEntity | null>;
  /** Solo pasa a "recibida" si seguía "por llegar" (evita recibir dos veces). */
  markReceived(id: string, data: ReceivedPurchaseData): Promise<PurchaseEntity | null>;
  /** Solo se cancela si seguía "por llegar". */
  cancel(id: string): Promise<PurchaseEntity | null>;
}
