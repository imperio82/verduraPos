import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { ExpenseFilters, NewExpense } from '../../domain/entities/expense.entity';
import { EXPENSE_MODEL, type ExpenseDocument, type ExpenseRecord } from '../models/expense.model';

export interface ExpenseDataSource {
  create(expense: NewExpense): Promise<ExpenseDocument>;
  find(filters: ExpenseFilters): Promise<ExpenseDocument[]>;
}

@Injectable()
export class MongoExpenseDataSource implements ExpenseDataSource {
  constructor(@InjectModel(EXPENSE_MODEL) private readonly model: Model<ExpenseRecord>) {}

  create({ cashSessionId, ...expense }: NewExpense): Promise<ExpenseDocument> {
    return this.model.create({
      ...expense,
      ...(cashSessionId && { cashSessionId: new Types.ObjectId(cashSessionId) }),
    });
  }

  find({ from, to }: ExpenseFilters): Promise<ExpenseDocument[]> {
    return this.model
      .find({ createdAt: { $gte: from, $lte: to } })
      .sort({ createdAt: -1 })
      .exec();
  }
}
