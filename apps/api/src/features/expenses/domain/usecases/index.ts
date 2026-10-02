import { roundMoney, ValidationError } from '@/core';
import type { CashSessionGuard } from '@/features/cash-registers/domain/usecases/cash-session.guard';
import type { CreateExpenseInput, ExpenseEntity, ExpenseFilters } from '../entities/expense.entity';
import type { ExpenseRepository } from '../repositories/expense.repository';

export class CreateExpenseUseCase {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly cashSessionGuard: CashSessionGuard,
  ) {}

  async execute(input: CreateExpenseInput): Promise<ExpenseEntity> {
    if (input.monto <= 0) throw new ValidationError('El monto debe ser mayor a cero', 'monto');
    // Todo gasto queda en una caja para que aparezca en su cierre; solo el
    // efectivo descuenta del dinero esperado.
    const session = await this.cashSessionGuard.resolveOpen(input.cashSessionId);

    return this.expenseRepository.create({
      concepto: input.concepto.trim(),
      destino: input.destino,
      monto: roundMoney(input.monto),
      metodoPago: input.metodoPago ?? 'efectivo',
      cashSessionId: session.id,
    });
  }
}

export class GetExpensesUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  execute(filters: ExpenseFilters): Promise<ExpenseEntity[]> {
    return this.expenseRepository.findAll(filters);
  }
}
