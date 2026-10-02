import type { PaymentMethod } from "@/features/cash-registers/domain/entities/cash-register.entity";
import type { ExpenseCategory, ExpenseEntity } from "@/features/expenses/domain/entities/expense.entity";
import type { SavingsGoalEntity } from "@/features/savings/domain/entities/savings.entity";

export interface DailyBalance {
	/** YYYY-MM-DD */
	fecha: string;
	ventas: number;
	gastos: number;
}

export interface AccountingSummaryEntity {
	desde: string;
	hasta: string;
	ventas: { count: number; total: number; porMetodo: Record<PaymentMethod, number> };
	gastos: {
		count: number;
		total: number;
		porDestino: Partial<Record<ExpenseCategory, number>>;
		items: ExpenseEntity[];
	};
	dineroFinal: number;
	serie: DailyBalance[];
	/** Ahorro acumulado en todas las metas activas. */
	ahorro: { ahorrado: number; metas: SavingsGoalEntity[] };
}

/** Escala de la gráfica de barras: el mayor valor de la serie = 100 %. */
export const seriesMax = (serie: DailyBalance[]): number =>
	Math.max(1, ...serie.flatMap((d) => [d.ventas, d.gastos]));
