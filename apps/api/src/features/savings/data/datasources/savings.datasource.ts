import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import type { DateRange } from '@/core';
import type { NewSavingsDeposit, NewSavingsGoal, SavingsGoalChanges } from '../../domain/entities/savings.entity';
import {
  SAVINGS_DEPOSIT_MODEL,
  SAVINGS_GOAL_MODEL,
  type SavingsDepositDocument,
  type SavingsDepositRecord,
  type SavingsGoalDocument,
  type SavingsGoalRecord,
} from '../models/savings.models';

export interface SavingsDataSource {
  findGoals(): Promise<SavingsGoalDocument[]>;
  findGoalById(id: string): Promise<SavingsGoalDocument | null>;
  createGoal(goal: NewSavingsGoal): Promise<SavingsGoalDocument>;
  updateGoal(id: string, changes: SavingsGoalChanges): Promise<SavingsGoalDocument | null>;
  createDeposit(deposit: NewSavingsDeposit): Promise<SavingsDepositDocument>;
  sumByGoal(range?: DateRange): Promise<{ _id: Types.ObjectId; total: number }[]>;
  recentDeposits(goalId: string, limit: number): Promise<SavingsDepositDocument[]>;
}

@Injectable()
export class MongoSavingsDataSource implements SavingsDataSource {
  constructor(
    @InjectModel(SAVINGS_GOAL_MODEL) private readonly goals: Model<SavingsGoalRecord>,
    @InjectModel(SAVINGS_DEPOSIT_MODEL) private readonly deposits: Model<SavingsDepositRecord>,
  ) {}

  findGoals(): Promise<SavingsGoalDocument[]> {
    return this.goals.find().sort({ activa: -1, createdAt: -1 }).exec();
  }

  findGoalById(id: string): Promise<SavingsGoalDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.goals.findById(id).exec();
  }

  createGoal(goal: NewSavingsGoal): Promise<SavingsGoalDocument> {
    return this.goals.create({ ...goal, activa: true });
  }

  updateGoal(id: string, changes: SavingsGoalChanges): Promise<SavingsGoalDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.goals.findByIdAndUpdate(id, { $set: changes }, { new: true }).exec();
  }

  createDeposit({ goalId, cashSessionId, ...deposit }: NewSavingsDeposit): Promise<SavingsDepositDocument> {
    return this.deposits.create({
      ...deposit,
      goalId: new Types.ObjectId(goalId),
      ...(cashSessionId && { cashSessionId: new Types.ObjectId(cashSessionId) }),
    });
  }

  sumByGoal(range?: DateRange): Promise<{ _id: Types.ObjectId; total: number }[]> {
    return this.deposits
      .aggregate([
        ...(range ? [{ $match: { createdAt: { $gte: range.from, $lte: range.to } } }] : []),
        { $group: { _id: '$goalId', total: { $sum: '$monto' } } },
      ])
      .exec();
  }

  recentDeposits(goalId: string, limit: number): Promise<SavingsDepositDocument[]> {
    return this.deposits
      .find({ goalId: new Types.ObjectId(goalId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
