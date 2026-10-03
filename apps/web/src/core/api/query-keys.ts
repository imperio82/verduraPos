/**
 * Claves de React Query centralizadas: varias features invalidan datos de otras
 * (una venta cambia el stock, la caja y la contabilidad), así se evitan ciclos.
 */
export const queryKeys = {
	products: ["products"] as const,
	suppliers: ["suppliers"] as const,
	cashRegisters: ["cash-registers"] as const,
	cashSessions: (params?: object) => ["cash-sessions", params ?? {}] as const,
	cashSessionsAll: ["cash-sessions"] as const,
	cashSession: (id: string) => ["cash-session", id] as const,
	cashSessionAll: ["cash-session"] as const,
	nextSaleNumber: ["sales", "next-number"] as const,
	dailySales: (day: string) => ["sales", "list", day] as const,
	dailySalesAll: ["sales", "list"] as const,
	dailyExpenses: (day: string) => ["expenses", "list", day] as const,
	dailyExpensesAll: ["expenses", "list"] as const,
	accounting: (params?: object) => ["accounting", params ?? {}] as const,
	accountingAll: ["accounting"] as const,
	savingsGoals: ["savings-goals"] as const,
	purchases: (params?: object) => ["purchases", "list", params ?? {}] as const,
	purchase: (id: string) => ["purchases", "detail", id] as const,
	lastPurchase: (supplierId: string) => ["purchases", "last", supplierId] as const,
	purchasesAll: ["purchases"] as const,
	lastRecount: ["inventory", "recount"] as const,
	damages: ["inventory", "damages"] as const,
} as const;

/** Todo lo que cambia cuando entra o sale dinero de una caja. */
export const MONEY_KEYS = [queryKeys.cashSessionsAll, queryKeys.cashSessionAll, queryKeys.cashRegisters, queryKeys.accountingAll, queryKeys.dailySalesAll, queryKeys.dailyExpensesAll];
