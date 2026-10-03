import { container } from "@/core/di/di-container";
import { ExpenseDatasource } from "../data/datasource/expense.datasource";
import { ExpenseRepositoryImpl } from "../data/repositories/expense.repository.impl";
import { GetDailyExpensesUseCase, RegisterExpenseUseCase } from "../domain/usecases";
import { TOKENS_EXPENSES as T } from "./tokens";

export function expensesConfigureContainer(): void {
	container.registerClass(T.ExpenseDatasource, ExpenseDatasource);
	container.registerClass(T.ExpenseRepository, ExpenseRepositoryImpl, [T.ExpenseDatasource]);
	container.registerClass(T.RegisterExpenseUseCase, RegisterExpenseUseCase, [T.ExpenseRepository]);
	container.registerClass(T.GetDailyExpensesUseCase, GetDailyExpensesUseCase, [T.ExpenseRepository]);
}
