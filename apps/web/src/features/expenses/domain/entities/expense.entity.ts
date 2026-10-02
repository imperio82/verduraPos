export const EXPENSE_CATEGORIES = [
	"proveedor",
	"transporte",
	"insumos",
	"personal",
	"servicios",
	"arriendo",
	"otros",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** Solo los gastos en efectivo salen del dinero de la caja. */
export const EXPENSE_PAYMENT_METHODS = ["efectivo", "transferencia"] as const;
export type ExpensePaymentMethod = (typeof EXPENSE_PAYMENT_METHODS)[number];

export const EXPENSE_PAYMENT_LABELS: Record<ExpensePaymentMethod, string> = {
	efectivo: "Efectivo de la caja",
	transferencia: "Transferencia",
};

export interface ExpenseEntity {
	id: string;
	concepto: string;
	destino: ExpenseCategory;
	monto: number;
	metodoPago: ExpensePaymentMethod;
	cashSessionId?: string;
	createdAt: string;
}

export interface CreateExpenseEntity {
	concepto: string;
	destino: ExpenseCategory;
	monto: number;
	metodoPago: ExpensePaymentMethod;
	/** Caja del turno: todo gasto queda en su cierre. */
	cashSessionId: string;
}

/** Etiqueta y tinte del destino del gasto (como en la pantalla de contabilidad). */
export const EXPENSE_CATEGORY_META: Record<ExpenseCategory, { label: string; tint: string }> = {
	proveedor: { label: "Proveedor", tint: "bg-tint-green" },
	transporte: { label: "Transporte", tint: "bg-tint-blue" },
	insumos: { label: "Insumos", tint: "bg-tint-orange" },
	personal: { label: "Personal", tint: "bg-tint-purple" },
	servicios: { label: "Servicios", tint: "bg-tint-sand" },
	arriendo: { label: "Arriendo", tint: "bg-tint-teal" },
	otros: { label: "Otros", tint: "bg-secondary" },
};
