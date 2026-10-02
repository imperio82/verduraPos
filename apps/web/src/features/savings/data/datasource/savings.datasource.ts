import APIClient, { resolveUrl } from "@/core/api/api-client";
import type {
	AddSavingsDepositEntity,
	SaveSavingsGoalEntity,
	SavingsDepositEntity,
	SavingsGoalEntity,
	UpdateSavingsGoalEntity,
} from "../../domain/entities/savings.entity";

export const urlsSavings = {
	goals: "/savings/goals",
	goal: "/savings/goals/:id",
	deposits: "/savings/goals/:id/deposits",
} as const;

export class SavingsDatasource {
	getGoals(): Promise<SavingsGoalEntity[]> {
		return APIClient.get({ url: urlsSavings.goals });
	}

	createGoal(goal: SaveSavingsGoalEntity): Promise<SavingsGoalEntity> {
		return APIClient.post({ url: urlsSavings.goals, data: goal });
	}

	updateGoal(id: string, changes: UpdateSavingsGoalEntity): Promise<SavingsGoalEntity> {
		return APIClient.patch({ url: resolveUrl(urlsSavings.goal, { id }), data: changes });
	}

	addDeposit({ goalId, ...data }: AddSavingsDepositEntity): Promise<SavingsDepositEntity> {
		return APIClient.post({ url: resolveUrl(urlsSavings.deposits, { id: goalId }), data });
	}
}
