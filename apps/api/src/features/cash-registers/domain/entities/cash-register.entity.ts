import type { PaymentMethod } from '@/core/constants/collections';

export interface CashRegisterEntity {
  id: string;
  nombre: string;
  activa: boolean;
  createdAt: Date;
}

export type CashSessionStatus = 'abierta' | 'cerrada';

export interface CashCountLine {
  denominacion: number;
  cantidad: number;
}

export interface CashClosing {
  conteo: CashCountLine[];
  monedas: number;
  contado: number;
  esperado: number;
  /** contado − esperado. Negativo = faltante, positivo = sobrante. */
  diferencia: number;
  observacion?: string;
}

export interface CashSessionEntity {
  id: string;
  cashRegisterId: string;
  cajaNombre: string;
  cajero: string;
  base: number;
  notaApertura?: string;
  estado: CashSessionStatus;
  abiertaEn: Date;
  cerradaEn?: Date;
  cierre?: CashClosing;
}

export interface CashMovementEntity {
  id: string;
  sessionId: string;
  tipo: 'ingreso';
  concepto: string;
  monto: number;
  createdAt: Date;
}

/** Totales de una sesión calculados a partir de ventas, gastos, ahorros, ingresos y dañados. */
export interface CashSessionTotals {
  ventasCount: number;
  ventasTotal: number;
  ventasPorMetodo: Record<PaymentMethod, number>;
  ingresosCount: number;
  ingresosTotal: number;
  /** Todos los gastos del turno (efectivo y transferencia). */
  gastosCount: number;
  gastosTotal: number;
  /** Solo lo que salió del efectivo de la caja. */
  gastosEfectivo: number;
  ahorroTotal: number;
  /** Producto dañado del turno: pérdida al costo, no mueve efectivo. */
  danadosCount: number;
  danadosCosto: number;
}

export type CashActivityType = 'apertura' | 'venta' | 'ingreso' | 'gasto' | 'ahorro' | 'danado' | 'reconteo';

export interface CashActivityItem {
  fecha: Date;
  tipo: CashActivityType;
  detalle: string;
  monto: number;
  /** false para lo que queda en el cierre pero no mueve efectivo (transferencias, dañados, reconteos). */
  afectaEfectivo?: boolean;
}

export const emptyTotals = (): CashSessionTotals => ({
  ventasCount: 0,
  ventasTotal: 0,
  ventasPorMetodo: { efectivo: 0, transferencia: 0, tarjeta: 0 },
  ingresosCount: 0,
  ingresosTotal: 0,
  gastosCount: 0,
  gastosTotal: 0,
  gastosEfectivo: 0,
  ahorroTotal: 0,
  danadosCount: 0,
  danadosCosto: 0,
});

/**
 * Regla de negocio del cierre: solo el efectivo se cuenta.
 * base + ventas en efectivo + otros ingresos − gastos en efectivo − enviado a ahorro.
 */
export const expectedCash = (base: number, totals: CashSessionTotals): number =>
  base + totals.ventasPorMetodo.efectivo + totals.ingresosTotal - totals.gastosEfectivo - totals.ahorroTotal;

export const countedCash = (conteo: CashCountLine[], monedas: number): number =>
  conteo.reduce((sum, line) => sum + line.denominacion * line.cantidad, 0) + monedas;
