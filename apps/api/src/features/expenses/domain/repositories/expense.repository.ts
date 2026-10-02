import type { ExpenseEntity, ExpenseFilters, NewExpense } from '../entities/expense.entity';

export interface ExpenseRepository {
  create(expense: NewExpense): Promise<ExpenseEntity>;
  findAll(filters: ExpenseFilters): Promise<ExpenseEntity[]>;
}
