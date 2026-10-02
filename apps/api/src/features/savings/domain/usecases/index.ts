import { BusinessRuleError, NotFoundError, roundMoney, ValidationError } from '@/core';
import type { CashSessionGuard } from '@/features/cash-registers/domain/usecases/cash-session.guard';
import {
  goalProgress,
  type NewSavingsGoal,
  periodBounds,
  previousPeriodBounds,
  SAVINGS_PERIODS,
  type SavingsDepositEntity,
  type SavingsGoalChanges,
  type SavingsGoalEntity,
  type SavingsGoalProgress,
} from '../entities/savings.entity';
import type { SavingsRepository } from '../repositories/savings.repository';

const RECENT_DEPOSITS = 5;

export class GetSavingsGoalsUseCase {
  constructor(private readonly savingsRepository: SavingsRepository) {}

  async execute(now = new Date()): Promise<SavingsGoalProgress[]> {
    // Lo ahorrado en el día/semana/mes actual y en el anterior; cada meta usa los de su periodo.
    const byPeriod = async (bounds: typeof periodBounds) => {
      const maps = await Promise.all(SAVINGS_PERIODS.map((p) => this.savingsRepository.totalsByGoal(bounds(p, now))));
      return new Map(SAVINGS_PERIODS.map((p, i) => [p, maps[i]]));
    };
    const [goals, totals, current, previous] = await Promise.all([
      this.savingsRepository.findGoals(),
      this.savingsRepository.totalsByGoal(),
      byPeriod(periodBounds),
      byPeriod(previousPeriodBounds),
    ]);
    return Promise.all(
      goals.map(async (goal) =>
        goalProgress(
          goal,
          totals.get(goal.id) ?? 0,
          current.get(goal.periodo)?.get(goal.id) ?? 0,
          previous.get(goal.periodo)?.get(goal.id) ?? 0,
          await this.savingsRepository.recentDeposits(goal.id, RECENT_DEPOSITS),
          now,
        ),
      ),
    );
  }
}

const validateGoal = (goal: Partial<NewSavingsGoal>): void => {
  if (goal.nombre !== undefined && goal.nombre.trim().length < 2) throw new ValidationError('Escribe el nombre de la meta', 'nombre');
  if (goal.meta !== undefined && goal.meta <= 0) throw new ValidationError('La meta debe ser mayor a cero', 'meta');
  if (goal.aportePeriodo !== undefined && goal.aportePeriodo <= 0) {
    throw new ValidationError('La cuota debe ser mayor a cero', 'aportePeriodo');
  }
  if (goal.meta !== undefined && goal.aportePeriodo !== undefined && goal.aportePeriodo > goal.meta) {
    throw new ValidationError('La cuota no puede ser mayor que la meta', 'aportePeriodo');
  }
};

export class CreateSavingsGoalUseCase {
  constructor(private readonly savingsRepository: SavingsRepository) {}

  execute(goal: NewSavingsGoal): Promise<SavingsGoalEntity> {
    validateGoal(goal);
    return this.savingsRepository.createGoal({
      nombre: goal.nombre.trim(),
      meta: roundMoney(goal.meta),
      periodo: goal.periodo,
      aportePeriodo: roundMoney(goal.aportePeriodo),
    });
  }
}

/** Editar la meta: nombre, valor, periodo, cuota o archivarla (activa = false). */
export class UpdateSavingsGoalUseCase {
  constructor(private readonly savingsRepository: SavingsRepository) {}

  async execute(id: string, changes: SavingsGoalChanges): Promise<SavingsGoalEntity> {
    const current = await this.savingsRepository.findGoalById(id);
    if (!current) throw new NotFoundError('Meta de ahorro no encontrada');
    validateGoal({ ...current, ...changes });
    const updated = await this.savingsRepository.updateGoal(id, {
      ...changes,
      ...(changes.nombre !== undefined && { nombre: changes.nombre.trim() }),
      ...(changes.meta !== undefined && { meta: roundMoney(changes.meta) }),
      ...(changes.aportePeriodo !== undefined && { aportePeriodo: roundMoney(changes.aportePeriodo) }),
    });
    if (!updated) throw new NotFoundError('Meta de ahorro no encontrada');
    return updated;
  }
}

export interface AddSavingsDepositInput {
  goalId: string;
  monto: number;
  cashSessionId?: string;
}

export class AddSavingsDepositUseCase {
  constructor(
    private readonly savingsRepository: SavingsRepository,
    private readonly cashSessionGuard: CashSessionGuard,
  ) {}

  async execute({ goalId, monto, cashSessionId }: AddSavingsDepositInput): Promise<SavingsDepositEntity> {
    const goal = await this.savingsRepository.findGoalById(goalId);
    if (!goal) throw new NotFoundError('Meta de ahorro no encontrada', 'goalId');
    if (!goal.activa) throw new BusinessRuleError(`La meta "${goal.nombre}" no está activa`);
    if (monto <= 0) throw new ValidationError('El monto debe ser mayor a cero', 'monto');
    if (cashSessionId) await this.cashSessionGuard.ensureOpen(cashSessionId);

    return this.savingsRepository.addDeposit({ goalId, goalNombre: goal.nombre, monto: roundMoney(monto), cashSessionId });
  }
}
