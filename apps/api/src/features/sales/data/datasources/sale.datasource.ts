import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types, type FilterQuery } from 'mongoose';
import { envs, type DateRange } from '@/core';
import type { PaymentMethod } from '@/core/constants/collections';
import { SequenceService } from '@/core/database/sequence.service';
import type { NewSale, SaleFilters } from '../../domain/entities/sale.entity';
import { SALE_MODEL, type SaleDocument, type SaleRecord } from '../models/sale.model';

const SALE_SEQUENCE = 'ventas';

export interface SaleDataSource {
  create(sale: NewSale, numero: number): Promise<SaleDocument>;
  find(filters: SaleFilters): Promise<SaleDocument[]>;
  totalsByMethod(range: DateRange): Promise<{ _id: PaymentMethod; count: number; total: number }[]>;
  totalsByDay(range: DateRange): Promise<{ _id: string; total: number }[]>;
  nextNumber(): Promise<number>;
  currentNumber(): Promise<number>;
}

@Injectable()
export class MongoSaleDataSource implements SaleDataSource {
  constructor(
    @InjectModel(SALE_MODEL) private readonly sales: Model<SaleRecord>,
    private readonly sequences: SequenceService,
  ) {}

  create(sale: NewSale, numero: number): Promise<SaleDocument> {
    return this.sales.create({
      ...sale,
      numero,
      cashSessionId: new Types.ObjectId(sale.cashSessionId),
      items: sale.items.map((item) => ({ ...item, productId: new Types.ObjectId(item.productId) })),
    });
  }

  find({ cashSessionId, from, to }: SaleFilters): Promise<SaleDocument[]> {
    const query: FilterQuery<SaleRecord> = {};
    if (cashSessionId && isValidObjectId(cashSessionId)) query.cashSessionId = new Types.ObjectId(cashSessionId);
    if (from || to) query.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
    return this.sales.find(query).sort({ createdAt: -1 }).limit(500).exec();
  }

  totalsByMethod({ from, to }: DateRange): Promise<{ _id: PaymentMethod; count: number; total: number }[]> {
    return this.sales
      .aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$metodoPago', count: { $sum: 1 }, total: { $sum: '$total' } } },
      ])
      .exec();
  }

  totalsByDay({ from, to }: DateRange): Promise<{ _id: string; total: number }[]> {
    return this.sales
      .aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: envs.timezone } },
            total: { $sum: '$total' },
          },
        },
      ])
      .exec();
  }

  nextNumber(): Promise<number> {
    return this.sequences.next(SALE_SEQUENCE);
  }

  currentNumber(): Promise<number> {
    return this.sequences.current(SALE_SEQUENCE);
  }
}
