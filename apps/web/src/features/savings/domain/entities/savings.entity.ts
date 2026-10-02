/** Cada cuánto se ahorra para la meta. */
export const SAVINGS_PERIODS = ["diario", "semanal", "mensual"] as const;
export type SavingsPeriod = (typeof SAVINGS_PERIODS)[number];

export const SAVINGS_PERIOD_META: Record<
	SavingsPeriod,
	{ label: string; quota: string; current: string; previous: string; unit: string; units: string }
> = {
	diario: { label: "Diario", quota: "Cuota diaria", current: "Hoy", previous: "Ayer", unit: "día", units: "días" },
	semanal: {
		label: "Semanal",
		quota: "Cuota semanal",
		current: "Esta semana",
		previous: "La semana pasada",
		unit: "semana",
		units: "semanas",
	},
	mensual: { label: "Mensual", quota: "Cuota mensual", current: "Este mes", previous: "El mes pasado", unit: "mes", units: "meses" },
};

export interface SavingsDepositEntity {
	id: string;
	goalId: string;
	goalNombre: string;
	monto: number;
	cashSessionId?: string;
	createdAt: string;
}

/**
 * Estado de la cuota del periodo actual:
 * cumplida · al_dia (va al ritmo) · atrasada (alerta) · meta_completa.
 * En metas diarias, "atrasada" significa que ayer no se cumplió la cuota.
 */
export type SavingsPeriodStatus = "cumplida" | "al_dia" | "atrasada" | "meta_completa";

export interface SavingsPeriodProgress {
	desde: string;
	hasta: string;
	/** Cuota del periodo (menor si a la meta le falta menos). */
	objetivo: number;
	ahorrado: number;
	/** 0–100: cumplimiento de la cuota. */
	porcentaje: number;
	/** Lo que se debería llevar a hoy si se ahorra parejo en el periodo. */
	esperadoALaFecha: number;
	estado: SavingsPeriodStatus;
	/** Cómo quedó el periodo anterior (ayer, la semana pasada o el mes pasado). */
	/** `aplica` es false si la meta aún no existía en ese periodo. */
	anterior: { ahorrado: number; objetivo: number; cumplido: boolean; aplica: boolean };
}

export interface SavingsGoalEntity {
	id: string;
	nombre: string;
	meta: number;
	periodo: SavingsPeriod;
	/** Cuota: cuánto se debe ahorrar en cada periodo. */
	aportePeriodo: number;
	activa: boolean;
	ahorrado: number;
	/** 0–100: avance de la meta total. */
	porcentaje: number;
	periodoActual: SavingsPeriodProgress;
	/** Periodos que faltan al ritmo de la cuota. */
	periodosRestantes: number;
	ultimosAportes: SavingsDepositEntity[];
	createdAt: string;
}

export interface SaveSavingsGoalEntity {
	nombre: string;
	meta: number;
	periodo: SavingsPeriod;
	aportePeriodo: number;
}

export type UpdateSavingsGoalEntity = Partial<SaveSavingsGoalEntity & { activa: boolean }>;

export interface AddSavingsDepositEntity {
	goalId: string;
	monto: number;
	/** "Pasar a ahorro" desde una caja: el efectivo sale de esa caja. */
	cashSessionId?: string;
}

export const remainingToGoal = (goal: Pick<SavingsGoalEntity, "meta" | "ahorrado">): number =>
	Math.max(0, goal.meta - goal.ahorrado);

/** Lo que falta para cumplir la cuota del periodo actual. */
export const remainingThisPeriod = (goal: Pick<SavingsGoalEntity, "periodoActual">): number =>
	Math.max(0, goal.periodoActual.objetivo - goal.periodoActual.ahorrado);

/** Cuántos periodos toma completar la meta con una cuota dada (para ayudar al crearla). */
export const periodsToComplete = (meta: number, aportePeriodo: number): number =>
	aportePeriodo > 0 ? Math.ceil(meta / aportePeriodo) : 0;

export const isBehind = (goal: Pick<SavingsGoalEntity, "activa" | "periodoActual">): boolean =>
	goal.activa && goal.periodoActual.estado === "atrasada";
