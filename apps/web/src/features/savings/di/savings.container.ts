import { container } from "@/core/di/di-container";
import { SavingsDatasource } from "../data/datasource/savings.datasource";
import { SavingsRepositoryImpl } from "../data/repositories/savings.repository.impl";
import {
	AddSavingsDepositUseCase,
	GetSavingsGoalsUseCase,
	SaveSavingsGoalUseCase,
	UpdateSavingsGoalUseCase,
} from "../domain/usecases";
import { TOKENS_SAVINGS as T } from "./tokens";

export function savingsConfigureContainer(): void {
	container.registerClass(T.SavingsDatasource, SavingsDatasource);
	container.registerClass(T.SavingsRepository, SavingsRepositoryImpl, [T.SavingsDatasource]);
	container.registerClass(T.GetSavingsGoalsUseCase, GetSavingsGoalsUseCase, [T.SavingsRepository]);
	container.registerClass(T.SaveSavingsGoalUseCase, SaveSavingsGoalUseCase, [T.SavingsRepository]);
	container.registerClass(T.UpdateSavingsGoalUseCase, UpdateSavingsGoalUseCase, [T.SavingsRepository]);
	container.registerClass(T.AddSavingsDepositUseCase, AddSavingsDepositUseCase, [T.SavingsRepository]);
}
