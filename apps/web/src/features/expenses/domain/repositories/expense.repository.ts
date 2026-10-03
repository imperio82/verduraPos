import type { CreateExpenseEntity, ExpenseEntity } from "../entities/expense.entity";

export interface ExpenseRepository {
	createExpense(expense: CreateExpenseEntity): Promise<ExpenseEntity>;
	getExpenses(day: string): Promise<ExpenseEntity[]>;
}
