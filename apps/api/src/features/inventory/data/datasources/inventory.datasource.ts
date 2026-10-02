import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { DateRange } from '@/core';
import type { NewDamage, NewRecount } from '../../domain/entities/inventory.entity';
import {
  DAMAGE_MODEL,
  RECOUNT_MODEL,
  type DamageDocument,
  type DamageRecord,
  type RecountDocument,
  type RecountRecord,
} from '../models/inventory.models';

export interface InventoryDataSource {
  createRecount(recount: NewRecount): Promise<RecountDocument>;
  findLastRecount(): Promise<RecountDocument | null>;
  createDamage(damage: NewDamage): Promise<DamageDocument>;
  findDamages(range: DateRange): Promise<DamageDocument[]>;
}

@Injectable()
export class MongoInventoryDataSource implements InventoryDataSource {
  constructor(
    @InjectModel(RECOUNT_MODEL) private readonly recounts: Model<RecountRecord>,
    @InjectModel(DAMAGE_MODEL) private readonly damages: Model<DamageRecord>,
  ) {}

  createRecount({ items, nota, cashSessionId }: NewRecount): Promise<RecountDocument> {
    return this.recounts.create({
      nota,
      items: items.map((item) => ({ ...item, productId: new Types.ObjectId(item.productId) })),
      ...(cashSessionId && { cashSessionId: new Types.ObjectId(cashSessionId) }),
    });
  }

  findLastRecount(): Promise<RecountDocument | null> {
    return this.recounts.findOne().sort({ createdAt: -1 }).exec();
  }

  createDamage({ productId, cashSessionId, ...damage }: NewDamage): Promise<DamageDocument> {
    return this.damages.create({
      ...damage,
      productId: new Types.ObjectId(productId),
      ...(cashSessionId && { cashSessionId: new Types.ObjectId(cashSessionId) }),
    });
  }

  findDamages({ from, to }: DateRange): Promise<DamageDocument[]> {
    return this.damages
      .find({ createdAt: { $gte: from, $lte: to } })
      .sort({ createdAt: -1 })
      .exec();
  }
}
