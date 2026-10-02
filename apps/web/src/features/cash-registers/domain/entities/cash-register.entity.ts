export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta";
export type CashSessionStatus = "abierta" | "cerrada";

export interface CashCountLine {
	denominacion: number;
	cantidad: number;
}

export interface CashClosing {
	conteo: CashCountLine[];
	monedas: number;
	contado: number;
	esperado: number;
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
	abiertaEn: string;
	cerradaEn?: string;
	cierre?: CashClosing;
}

export interface CashRegisterEntity {
	id: string;
	nombre: string;
	activa: boolean;
	sesionAbierta: CashSessionEntity | null;
}

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

export interface CashSessionSummary extends CashSessionEntity {
	totales: CashSessionTotals;
	efectivoEsperado: number;
}

export type CashActivityType = "apertura" | "venta" | "ingreso" | "gasto" | "ahorro" | "danado" | "reconteo";

export interface CashActivityItem {
	fecha: string;
	tipo: CashActivityType;
	detalle: string;
	monto: number;
	/** false para lo que queda en el cierre pero no mueve efectivo (transferencias, dañados, reconteos). */
	afectaEfectivo?: boolean;
}

export interface CashSessionDetail extends CashSessionSummary {
	actividad: CashActivityItem[];
}

export interface OpenCashSessionEntity {
	cashRegisterId: string;
	cajero: string;
	base: number;
	notaApertura?: string;
}

export interface CloseCashSessionEntity {
	conteo: CashCountLine[];
	monedas: number;
	observacion?: string;
}

// ---------- Reglas de negocio de caja ----------

/** Billetes colombianos en circulación, de mayor a menor. */
export const DENOMINATIONS = [100_000, 50_000, 20_000, 10_000, 5_000, 2_000] as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
	efectivo: "Efectivo",
	transferencia: "Transferencia",
	tarjeta: "Tarjeta",
};

export const countedCash = (conteo: CashCountLine[], monedas: number): number =>
	conteo.reduce((sum, line) => sum + line.denominacion * line.cantidad, 0) + monedas;

/** Desglose del efectivo esperado (solo el efectivo se cuenta en el cierre). */
export const expectedCashBreakdown = (session: CashSessionSummary) => [
	{ label: "Base de apertura", value: session.base },
	{ label: "+ Ventas en efectivo", value: session.totales.ventasPorMetodo.efectivo },
	{ label: "+ Otros ingresos", value: session.totales.ingresosTotal },
	{ label: "− Gastos en efectivo", value: session.totales.gastosEfectivo },
	{ label: "− Enviado a ahorro", value: session.totales.ahorroTotal },
];

/** Negativo = faltante, positivo = sobrante. */
export const differenceLabel = (diferencia: number): string =>
	diferencia < 0 ? "Faltante" : diferencia > 0 ? "Sobrante" : "Cuadra";
