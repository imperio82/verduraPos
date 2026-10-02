import type {
	AddSavingsDepositEntity,
	SaveSavingsGoalEntity,
	SavingsDepositEntity,
	SavingsGoalEntity,
	UpdateSavingsGoalEntity,
} from "../../domain/entities/savings.entity";
import type { SavingsRepository } from "../../domain/repositories/savings.repository";
import type { SavingsDatasource } from "../datasource/savings.datasource";

export class SavingsRepositoryImpl implements SavingsRepository {
	constructor(private readonly savingsDatasource: SavingsDatasource) {}

	getGoals(): Promise<SavingsGoalEntity[]> {
		return this.savingsDatasource.getGoals();
	}

	createGoal(goal: SaveSavingsGoalEntity): Promise<SavingsGoalEntity> {
		return this.savingsDatasource.createGoal(goal);
	}

	updateGoal(id: string, changes: UpdateSavingsGoalEntity): Promise<SavingsGoalEntity> {
		return this.savingsDatasource.updateGoal(id, changes);
	}

	addDeposit(deposit: AddSavingsDepositEntity): Promise<SavingsDepositEntity> {
		return this.savingsDatasource.addDeposit(deposit);
	}
}
