import { Module } from '@nestjs/common';
import { EXPENSE_TOKENS } from '../expenses/di/expenses.tokens';
import type { ExpenseRepository } from '../expenses/domain/repositories/expense.repository';
import { ExpensesModule } from '../expenses/expenses.module';
import { SALE_TOKENS } from '../sales/di/sales.tokens';
import type { SaleRepository } from '../sales/domain/repositories/sale.repository';
import { SalesModule } from '../sales/sales.module';
import { GetSavingsGoalsUseCase } from '../savings/domain/usecases';
import { SavingsModule } from '../savings/savings.module';
import { GetAccountingSummaryUseCase } from './domain/usecases/get-accounting-summary.usecase';
import { AccountingController } from './presentation/controllers/accounting.controller';

/** Contabilidad: feature de solo lectura que consolida ventas, gastos y ahorro. */
@Module({
  imports: [SalesModule, ExpensesModule, SavingsModule],
  controllers: [AccountingController],
  providers: [
    {
      provide: GetAccountingSummaryUseCase,
      useFactory: (s: SaleRepository, e: ExpenseRepository, g: GetSavingsGoalsUseCase) =>
        new GetAccountingSummaryUseCase(s, e, g),
      inject: [SALE_TOKENS.SaleRepository, EXPENSE_TOKENS.ExpenseRepository, GetSavingsGoalsUseCase],
    },
  ],
})
export class AccountingModule {}
