import APIClient from "@/core/api/api-client";
import type { CreateExpenseEntity, ExpenseEntity } from "../../domain/entities/expense.entity";

export const urlsExpenses = {
	createExpense: "/expenses",
	getExpenses: "/expenses",
} as const;

export class ExpenseDatasource {
	createExpense(expense: CreateExpenseEntity): Promise<ExpenseEntity> {
		return APIClient.post<ExpenseEntity>({ url: urlsExpenses.createExpense, data: expense });
	}

	/** Gastos de un día (YYYY-MM-DD). */
	getExpenses(day: string): Promise<ExpenseEntity[]> {
		return APIClient.get<ExpenseEntity[]>({ url: urlsExpenses.getExpenses, params: { from: day, to: day } });
	}
}
