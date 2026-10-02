import { dayKey, daysInRange, type DateRange } from '@/core';
import type { ExpenseEntity } from '@/features/expenses/domain/entities/expense.entity';
import type { ExpenseRepository } from '@/features/expenses/domain/repositories/expense.repository';
import type { SaleRepository } from '@/features/sales/domain/repositories/sale.repository';
import type { GetSavingsGoalsUseCase } from '@/features/savings/domain/usecases';
import type { AccountingSummary, DailyBalance } from '../entities/accounting-summary.entity';

const MIN_SERIES_DAYS = 7;

/**
 * Consolidado del periodo: ventas, gastos, dinero final, serie diaria y ahorro.
 * El periodo lo elige el usuario (hoy, 2 días, semana, mes o rango libre).
 */
export class GetAccountingSummaryUseCase {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly expenseRepository: ExpenseRepository,
    private readonly getSavingsGoals: GetSavingsGoalsUseCase,
  ) {}

  async execute(range: DateRange): Promise<AccountingSummary> {
    const seriesRange = this.seriesRange(range);

    const [ventas, expenses, dailySales, seriesExpenses, goals] = await Promise.all([
      this.saleRepository.totals(range),
      this.expenseRepository.findAll(range),
      this.saleRepository.dailyTotals(seriesRange),
      this.expenseRepository.findAll(seriesRange),
      this.getSavingsGoals.execute(),
    ]);

    const gastosTotal = expenses.reduce((sum, e) => sum + e.monto, 0);
    const metas = goals.filter((goal) => goal.activa);

    return {
      desde: dayKey(range.from),
      hasta: dayKey(range.to),
      ventas,
      gastos: {
        count: expenses.length,
        total: gastosTotal,
        porDestino: this.groupByCategory(expenses),
        items: expenses,
      },
      dineroFinal: ventas.total - gastosTotal,
      serie: this.buildSeries(seriesRange, dailySales, seriesExpenses),
      ahorro: { ahorrado: metas.reduce((sum, goal) => sum + goal.ahorrado, 0), metas },
    };
  }

  /** Para periodos cortos la gráfica muestra igual los últimos 7 días. */
  private seriesRange(range: DateRange): DateRange {
    const days = daysInRange(range).length;
    if (days >= MIN_SERIES_DAYS) return range;
    const from = new Date(range.to);
    from.setDate(from.getDate() - (MIN_SERIES_DAYS - 1));
    from.setHours(0, 0, 0, 0);
    return { from, to: range.to };
  }

  private buildSeries(
    range: DateRange,
    dailySales: { fecha: string; total: number }[],
    expenses: ExpenseEntity[],
  ): DailyBalance[] {
    const salesByDay = new Map(dailySales.map((d) => [d.fecha, d.total]));
    const expensesByDay = new Map<string, number>();
    for (const expense of expenses) {
      const key = dayKey(expense.createdAt);
      expensesByDay.set(key, (expensesByDay.get(key) ?? 0) + expense.monto);
    }
    return daysInRange(range).map((fecha) => ({
      fecha,
      ventas: salesByDay.get(fecha) ?? 0,
      gastos: expensesByDay.get(fecha) ?? 0,
    }));
  }

  private groupByCategory(expenses: ExpenseEntity[]): AccountingSummary['gastos']['porDestino'] {
    return expenses.reduce<AccountingSummary['gastos']['porDestino']>((acc, e) => {
      acc[e.destino] = (acc[e.destino] ?? 0) + e.monto;
      return acc;
    }, {});
  }
}
