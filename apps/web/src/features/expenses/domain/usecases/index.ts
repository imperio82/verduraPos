import { AppError } from "@/core/errors/app-error";
import type { CreateExpenseEntity, ExpenseEntity } from "../entities/expense.entity";
import type { ExpenseRepository } from "../repositories/expense.repository";

export class RegisterExpenseUseCase {
	constructor(private readonly expenseRepository: ExpenseRepository) {}

	execute(expense: CreateExpenseEntity): Promise<ExpenseEntity> {
		if (expense.concepto.trim().length < 2) throw new AppError("Escribe en qué se gastó", "VALIDATION_ERROR");
		if (expense.monto <= 0) throw new AppError("El monto debe ser mayor a cero", "VALIDATION_ERROR");
		return this.expenseRepository.createExpense({ ...expense, concepto: expense.concepto.trim() });
	}
}

export class GetDailyExpensesUseCase {
	constructor(private readonly repository: ExpenseRepository) {}

	execute(day: string): Promise<ExpenseEntity[]> {
		return this.repository.getExpenses(day);
	}
}
