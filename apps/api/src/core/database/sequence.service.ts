import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections';

export const COUNTER_MODEL = 'Counter';

export interface CounterRecord {
  _id: string;
  seq: number;
}

export const CounterSchema = new Schema<CounterRecord>(
  { _id: { type: String, required: true }, seq: { type: Number, required: true, default: 0 } },
  { collection: COLLECTIONS.counters, versionKey: false },
);

/** Consecutivos atómicos compartidos (número de venta, número de pedido...). */
@Injectable()
export class SequenceService {
  constructor(@InjectModel(COUNTER_MODEL) private readonly counters: Model<CounterRecord>) {}

  async next(name: string): Promise<number> {
    const counter = await this.counters
      .findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { new: true, upsert: true })
      .exec();
    return counter.seq;
  }

  async current(name: string): Promise<number> {
    const counter = await this.counters.findById(name).lean().exec();
    return counter?.seq ?? 0;
  }
}
