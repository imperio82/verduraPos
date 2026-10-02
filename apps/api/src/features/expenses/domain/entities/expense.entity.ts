/** Destino del gasto o pago. */
export const EXPENSE_CATEGORIES = ['proveedor', 'transporte', 'insumos', 'personal', 'servicios', 'arriendo', 'otros'] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** Solo los gastos en efectivo salen del dinero de la caja. */
export const EXPENSE_PAYMENT_METHODS = ['efectivo', 'transferencia'] as const;
export type ExpensePaymentMethod = (typeof EXPENSE_PAYMENT_METHODS)[number];

export interface ExpenseEntity {
  id: string;
  concepto: string;
  destino: ExpenseCategory;
  monto: number;
  metodoPago: ExpensePaymentMethod;
  /** Caja del turno en que se registró. Los gastos antiguos pueden no tenerla. */
  cashSessionId?: string;
  createdAt: Date;
}

export type NewExpense = Omit<ExpenseEntity, 'id' | 'createdAt'>;

export interface CreateExpenseInput extends Omit<NewExpense, 'metodoPago' | 'cashSessionId'> {
  metodoPago?: ExpensePaymentMethod;
  /** Si no se indica, se liga a la última caja abierta. */
  cashSessionId?: string;
}

export interface ExpenseFilters {
  from: Date;
  to: Date;
}
