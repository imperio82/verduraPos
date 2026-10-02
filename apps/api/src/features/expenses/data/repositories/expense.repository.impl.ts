import type { ExpenseEntity, ExpenseFilters, NewExpense } from '../../domain/entities/expense.entity';
import type { ExpenseRepository } from '../../domain/repositories/expense.repository';
import type { ExpenseDataSource } from '../datasources/expense.datasource';
import { toExpenseEntity } from '../models/expense.model';

export class ExpenseRepositoryImpl implements ExpenseRepository {
  constructor(private readonly dataSource: ExpenseDataSource) {}

  async create(expense: NewExpense): Promise<ExpenseEntity> {
    return toExpenseEntity(await this.dataSource.create(expense));
  }

  async findAll(filters: ExpenseFilters): Promise<ExpenseEntity[]> {
    return (await this.dataSource.find(filters)).map(toExpenseEntity);
  }
}
