/**
 * Nombres de colecciones Mongo. Centralizados porque algunos read-models
 * (reportes de caja, contabilidad) consultan colecciones de otras features.
 */
export const COLLECTIONS = {
  products: 'productos',
  suppliers: 'proveedores',
  cashRegisters: 'cajas',
  cashSessions: 'caja_sesiones',
  cashMovements: 'caja_movimientos',
  sales: 'ventas',
  counters: 'contadores',
  expenses: 'gastos',
  savingsGoals: 'ahorro_metas',
  savingsDeposits: 'ahorro_aportes',
  purchases: 'compras',
  recounts: 'reconteos',
  damages: 'danados',
} as const;

export const PAYMENT_METHODS = ['efectivo', 'transferencia', 'tarjeta'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
