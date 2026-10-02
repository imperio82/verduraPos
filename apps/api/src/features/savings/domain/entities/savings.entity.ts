import type { DateRange } from '@/core';

/** Cada cuánto se ahorra para la meta. */
export const SAVINGS_PERIODS = ['diario', 'semanal', 'mensual'] as const;
export type SavingsPeriod = (typeof SAVINGS_PERIODS)[number];

export interface SavingsGoalEntity {
  id: string;
  nombre: string;
  /** Valor objetivo a ahorrar. */
  meta: number;
  periodo: SavingsPeriod;
  /** Cuota: cuánto se debe ahorrar en cada periodo. */
  aportePeriodo: number;
  activa: boolean;
  createdAt: Date;
}

export type NewSavingsGoal = Pick<SavingsGoalEntity, 'nombre' | 'meta' | 'periodo' | 'aportePeriodo'>;
export type SavingsGoalChanges = Partial<NewSavingsGoal & Pick<SavingsGoalEntity, 'activa'>>;

export interface SavingsDepositEntity {
  id: string;
  goalId: string;
  goalNombre: string;
  monto: number;
  /** Si el dinero salió de una caja abierta ("Pasar a ahorro"). */
  cashSessionId?: string;
  createdAt: Date;
}

export type NewSavingsDeposit = Omit<SavingsDepositEntity, 'id' | 'createdAt'>;

/**
 * Estado de la cuota del periodo actual:
 * - cumplida: ya se ahorró la cuota,
 * - al_dia: aún no, pero va al ritmo esperado para la fecha,
 * - atrasada: va por debajo de lo que debería llevar a hoy (en metas diarias:
 *   ayer no se cumplió la cuota y hoy todavía no),
 * - meta_completa: la meta total ya se alcanzó.
 */
export type SavingsPeriodStatus = 'cumplida' | 'al_dia' | 'atrasada' | 'meta_completa';

export interface SavingsPeriodProgress {
  desde: Date;
  hasta: Date;
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

export interface SavingsGoalProgress extends SavingsGoalEntity {
  ahorrado: number;
  /** 0–100: avance de la meta total. */
  porcentaje: number;
  periodoActual: SavingsPeriodProgress;
  /** Periodos que faltan al ritmo de la cuota (0 si ya se completó). */
  periodosRestantes: number;
  ultimosAportes: SavingsDepositEntity[];
}

const DAY_MS = 86_400_000;

/** Día, semana de lunes a domingo o mes calendario que contiene `now`. */
export const periodBounds = (periodo: SavingsPeriod, now = new Date()): DateRange => {
  if (periodo === 'diario') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
    };
  }
  if (periodo === 'mensual') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 6, 23, 59, 59, 999);
  return { from, to };
};

/** El periodo inmediatamente anterior al actual. */
export const previousPeriodBounds = (periodo: SavingsPeriod, now = new Date()): DateRange =>
  periodBounds(periodo, new Date(periodBounds(periodo, now).from.getTime() - 1));

const percent = (value: number, total: number): number =>
  total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 100;

export const periodProgress = (
  goal: Pick<SavingsGoalEntity, 'meta' | 'periodo' | 'aportePeriodo' | 'createdAt'>,
  ahorradoTotal: number,
  ahorradoPeriodo: number,
  ahorradoAnterior: number,
  now = new Date(),
): SavingsPeriodProgress => {
  const { from, to } = periodBounds(goal.periodo, now);
  const previous = previousPeriodBounds(goal.periodo, now);
  // Si a la meta le falta menos que la cuota, la cuota del periodo es lo que falta.
  const faltabaAlIniciar = Math.max(0, goal.meta - (ahorradoTotal - ahorradoPeriodo));
  const objetivo = Math.min(goal.aportePeriodo, faltabaAlIniciar);
  const objetivoAnterior = Math.min(goal.aportePeriodo, faltabaAlIniciar + ahorradoAnterior);
  const existedLastPeriod = goal.createdAt.getTime() <= previous.from.getTime();
  const anterior = {
    ahorrado: ahorradoAnterior,
    objetivo: objetivoAnterior,
    cumplido: !existedLastPeriod || ahorradoAnterior >= objetivoAnterior,
    aplica: existedLastPeriod,
  };

  // En el periodo en que se creó la meta no se exige ritmo: no sería justo alertar el primer día.
  const createdThisPeriod = goal.createdAt.getTime() > from.getTime();
  let esperadoALaFecha = 0;
  if (!createdThisPeriod && goal.periodo !== 'diario') {
    const totalDays = Math.round((to.getTime() + 1 - from.getTime()) / DAY_MS);
    const elapsedDays = Math.min(totalDays, Math.floor((now.getTime() - from.getTime()) / DAY_MS) + 1);
    esperadoALaFecha = Math.round((objetivo * elapsedDays) / totalDays);
  }
  // Lo diario se ahorra al cierre: durante el día solo se alerta si ayer quedó incumplido.
  const behind = goal.periodo === 'diario' ? !anterior.cumplido : ahorradoPeriodo < esperadoALaFecha;

  const estado: SavingsPeriodStatus =
    ahorradoTotal >= goal.meta ? 'meta_completa' : ahorradoPeriodo >= objetivo ? 'cumplida' : behind ? 'atrasada' : 'al_dia';

  return {
    desde: from,
    hasta: to,
    objetivo,
    ahorrado: ahorradoPeriodo,
    porcentaje: percent(ahorradoPeriodo, objetivo),
    esperadoALaFecha,
    estado,
    anterior,
  };
};

export const goalProgress = (
  goal: SavingsGoalEntity,
  ahorrado: number,
  ahorradoPeriodo: number,
  ahorradoAnterior: number,
  ultimosAportes: SavingsDepositEntity[],
  now = new Date(),
): SavingsGoalProgress => {
  const falta = Math.max(0, goal.meta - ahorrado);
  return {
    ...goal,
    ahorrado,
    porcentaje: percent(ahorrado, goal.meta),
    periodoActual: periodProgress(goal, ahorrado, ahorradoPeriodo, ahorradoAnterior, now),
    periodosRestantes: goal.aportePeriodo > 0 ? Math.ceil(falta / goal.aportePeriodo) : 0,
    ultimosAportes,
  };
};
