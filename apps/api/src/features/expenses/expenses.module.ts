import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashRegistersModule } from '../cash-registers/cash-registers.module';
import { CashSessionGuard } from '../cash-registers/domain/usecases';
import { MongoExpenseDataSource, type ExpenseDataSource } from './data/datasources/expense.datasource';
import { EXPENSE_MODEL, ExpenseSchema } from './data/models/expense.model';
import { ExpenseRepositoryImpl } from './data/repositories/expense.repository.impl';
import { EXPENSE_TOKENS } from './di/expenses.tokens';
import type { ExpenseRepository } from './domain/repositories/expense.repository';
import { CreateExpenseUseCase, GetExpensesUseCase } from './domain/usecases';
import { ExpensesController } from './presentation/controllers/expenses.controller';

const repo = EXPENSE_TOKENS.ExpenseRepository;

@Module({
  imports: [MongooseModule.forFeature([{ name: EXPENSE_MODEL, schema: ExpenseSchema }]), CashRegistersModule],
  controllers: [ExpensesController],
  providers: [
    { provide: EXPENSE_TOKENS.ExpenseDataSource, useClass: MongoExpenseDataSource },
    {
      provide: repo,
      useFactory: (ds: ExpenseDataSource) => new ExpenseRepositoryImpl(ds),
      inject: [EXPENSE_TOKENS.ExpenseDataSource],
    },
    {
      provide: CreateExpenseUseCase,
      useFactory: (r: ExpenseRepository, g: CashSessionGuard) => new CreateExpenseUseCase(r, g),
      inject: [repo, CashSessionGuard],
    },
    { provide: GetExpensesUseCase, useFactory: (r: ExpenseRepository) => new GetExpensesUseCase(r), inject: [repo] },
  ],
  exports: [repo],
})
export class ExpensesModule {}
