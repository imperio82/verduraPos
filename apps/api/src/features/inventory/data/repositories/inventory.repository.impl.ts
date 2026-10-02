import type { DateRange } from '@/core';
import type { DamageEntity, NewDamage, NewRecount, RecountEntity } from '../../domain/entities/inventory.entity';
import type { InventoryRepository } from '../../domain/repositories/inventory.repository';
import type { InventoryDataSource } from '../datasources/inventory.datasource';
import { toDamageEntity, toRecountEntity } from '../models/inventory.models';

export class InventoryRepositoryImpl implements InventoryRepository {
  constructor(private readonly dataSource: InventoryDataSource) {}

  async createRecount(recount: NewRecount): Promise<RecountEntity> {
    return toRecountEntity(await this.dataSource.createRecount(recount));
  }

  async findLastRecount(): Promise<RecountEntity | null> {
    const doc = await this.dataSource.findLastRecount();
    return doc ? toRecountEntity(doc) : null;
  }

  async createDamage(damage: NewDamage): Promise<DamageEntity> {
    return toDamageEntity(await this.dataSource.createDamage(damage));
  }

  async findDamages(range: DateRange): Promise<DamageEntity[]> {
    return (await this.dataSource.findDamages(range)).map(toDamageEntity);
  }
}
