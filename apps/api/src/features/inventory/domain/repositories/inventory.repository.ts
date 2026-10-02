import type { DateRange } from '@/core';
import type { DamageEntity, NewDamage, NewRecount, RecountEntity } from '../entities/inventory.entity';

export interface InventoryRepository {
  createRecount(recount: NewRecount): Promise<RecountEntity>;
  findLastRecount(): Promise<RecountEntity | null>;
  createDamage(damage: NewDamage): Promise<DamageEntity>;
  findDamages(range: DateRange): Promise<DamageEntity[]>;
}
