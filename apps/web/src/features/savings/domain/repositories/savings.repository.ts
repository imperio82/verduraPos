import type {
	AddSavingsDepositEntity,
	SaveSavingsGoalEntity,
	SavingsDepositEntity,
	SavingsGoalEntity,
	UpdateSavingsGoalEntity,
} from "../entities/savings.entity";

export interface SavingsRepository {
	getGoals(): Promise<SavingsGoalEntity[]>;
	createGoal(goal: SaveSavingsGoalEntity): Promise<SavingsGoalEntity>;
	updateGoal(id: string, changes: UpdateSavingsGoalEntity): Promise<SavingsGoalEntity>;
	addDeposit(deposit: AddSavingsDepositEntity): Promise<SavingsDepositEntity>;
}
