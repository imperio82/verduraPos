import type { CreateExpenseEntity, ExpenseEntity } from "../../domain/entities/expense.entity";
import type { ExpenseRepository } from "../../domain/repositories/expense.repository";
import type { ExpenseDatasource } from "../datasource/expense.datasource";

export class ExpenseRepositoryImpl implements ExpenseRepository {
	constructor(private readonly expenseDatasource: ExpenseDatasource) {}

	createExpense(expense: CreateExpenseEntity): Promise<ExpenseEntity> {
		return this.expenseDatasource.createExpense(expense);
	}

	getExpenses(day: string): Promise<ExpenseEntity[]> {
		return this.expenseDatasource.getExpenses(day);
	}
}
