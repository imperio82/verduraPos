import type { DateRange } from '@/core';
import type {
  NewSavingsDeposit,
  NewSavingsGoal,
  SavingsDepositEntity,
  SavingsGoalChanges,
  SavingsGoalEntity,
} from '../entities/savings.entity';

export interface SavingsRepository {
  findGoals(): Promise<SavingsGoalEntity[]>;
  findGoalById(id: string): Promise<SavingsGoalEntity | null>;
  createGoal(goal: NewSavingsGoal): Promise<SavingsGoalEntity>;
  updateGoal(id: string, changes: SavingsGoalChanges): Promise<SavingsGoalEntity | null>;
  addDeposit(deposit: NewSavingsDeposit): Promise<SavingsDepositEntity>;
  /** Total ahorrado por meta; con rango, solo los aportes de ese rango. */
  totalsByGoal(range?: DateRange): Promise<Map<string, number>>;
  recentDeposits(goalId: string, limit: number): Promise<SavingsDepositEntity[]>;
}
