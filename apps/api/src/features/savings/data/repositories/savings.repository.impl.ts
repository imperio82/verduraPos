import type { DateRange } from '@/core';
import type {
  NewSavingsDeposit,
  NewSavingsGoal,
  SavingsDepositEntity,
  SavingsGoalChanges,
  SavingsGoalEntity,
} from '../../domain/entities/savings.entity';
import type { SavingsRepository } from '../../domain/repositories/savings.repository';
import type { SavingsDataSource } from '../datasources/savings.datasource';
import { toSavingsDepositEntity, toSavingsGoalEntity } from '../models/savings.models';

export class SavingsRepositoryImpl implements SavingsRepository {
  constructor(private readonly dataSource: SavingsDataSource) {}

  async findGoals(): Promise<SavingsGoalEntity[]> {
    return (await this.dataSource.findGoals()).map(toSavingsGoalEntity);
  }

  async findGoalById(id: string): Promise<SavingsGoalEntity | null> {
    const doc = await this.dataSource.findGoalById(id);
    return doc ? toSavingsGoalEntity(doc) : null;
  }

  async createGoal(goal: NewSavingsGoal): Promise<SavingsGoalEntity> {
    return toSavingsGoalEntity(await this.dataSource.createGoal(goal));
  }

  async updateGoal(id: string, changes: SavingsGoalChanges): Promise<SavingsGoalEntity | null> {
    const doc = await this.dataSource.updateGoal(id, changes);
    return doc ? toSavingsGoalEntity(doc) : null;
  }

  async addDeposit(deposit: NewSavingsDeposit): Promise<SavingsDepositEntity> {
    return toSavingsDepositEntity(await this.dataSource.createDeposit(deposit));
  }

  async totalsByGoal(range?: DateRange): Promise<Map<string, number>> {
    const rows = await this.dataSource.sumByGoal(range);
    return new Map(rows.map((row) => [row._id.toString(), row.total]));
  }

  async recentDeposits(goalId: string, limit: number): Promise<SavingsDepositEntity[]> {
    return (await this.dataSource.recentDeposits(goalId, limit)).map(toSavingsDepositEntity);
  }
}
