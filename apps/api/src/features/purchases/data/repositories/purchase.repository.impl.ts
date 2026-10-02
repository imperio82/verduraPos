import type { NewPurchase, PurchaseEntity, ReceivedPurchaseData } from '../../domain/entities/purchase.entity';
import type { PurchaseFilters, PurchaseRepository } from '../../domain/repositories/purchase.repository';
import type { PurchaseDataSource } from '../datasources/purchase.datasource';
import { type PurchaseDocument, toPurchaseEntity } from '../models/purchase.models';

const toEntityOrNull = (doc: PurchaseDocument | null): PurchaseEntity | null => (doc ? toPurchaseEntity(doc) : null);

export class PurchaseRepositoryImpl implements PurchaseRepository {
  constructor(private readonly dataSource: PurchaseDataSource) {}

  async create(purchase: NewPurchase): Promise<PurchaseEntity> {
    return toPurchaseEntity(await this.dataSource.create(purchase));
  }

  async findAll(filters: PurchaseFilters): Promise<PurchaseEntity[]> {
    return (await this.dataSource.find(filters)).map(toPurchaseEntity);
  }

  async findById(id: string): Promise<PurchaseEntity | null> {
    return toEntityOrNull(await this.dataSource.findById(id));
  }

  async findLastBySupplier(supplierId: string): Promise<PurchaseEntity | null> {
    return toEntityOrNull(await this.dataSource.findLastBySupplier(supplierId));
  }

  async markReceived(id: string, data: ReceivedPurchaseData): Promise<PurchaseEntity | null> {
    return toEntityOrNull(await this.dataSource.markReceived(id, data));
  }

  async cancel(id: string): Promise<PurchaseEntity | null> {
    return toEntityOrNull(await this.dataSource.cancel(id));
  }
}
