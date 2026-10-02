import type { ExpenseCategory, ExpenseEntity } from '@/features/expenses/domain/entities/expense.entity';
import type { SalesTotals } from '@/features/sales/domain/entities/sale.entity';
import type { SavingsGoalProgress } from '@/features/savings/domain/entities/savings.entity';

export interface DailyBalance {
  /** YYYY-MM-DD */
  fecha: string;
  ventas: number;
  gastos: number;
}

export interface AccountingSummary {
  desde: string;
  hasta: string;
  ventas: SalesTotals;
  gastos: {
    count: number;
    total: number;
    porDestino: Partial<Record<ExpenseCategory, number>>;
    items: ExpenseEntity[];
  };
  /** Ventas − gastos del periodo. */
  dineroFinal: number;
  /** Serie diaria para la gráfica (mínimo 7 días). */
  serie: DailyBalance[];
  /** Ahorro acumulado en todas las metas activas (no depende del periodo ni de la caja). */
  ahorro: {
    ahorrado: number;
    metas: SavingsGoalProgress[];
  };
}
