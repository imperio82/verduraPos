import { BusinessRuleError, lastDays, NotFoundError, roundMoney, ValidationError } from '@/core';
import {
  countedCash,
  emptyTotals,
  expectedCash,
  type CashActivityItem,
  type CashCountLine,
  type CashMovementEntity,
  type CashSessionEntity,
  type CashSessionStatus,
  type CashSessionTotals,
} from '../entities/cash-register.entity';
import type { CashRegisterRepository, CashSessionActivityReader } from '../repositories/cash-register.repository';
import type { CashSessionGuard } from './cash-session.guard';

export interface CashSessionSummary extends CashSessionEntity {
  totales: CashSessionTotals;
  efectivoEsperado: number;
}

export interface CashSessionDetail extends CashSessionSummary {
  actividad: CashActivityItem[];
}

const toSummary = (session: CashSessionEntity, totals: CashSessionTotals | undefined): CashSessionSummary => {
  const totales = totals ?? emptyTotals();
  return { ...session, totales, efectivoEsperado: expectedCash(session.base, totales) };
};

export interface OpenCashSessionInput {
  cashRegisterId: string;
  cajero: string;
  base: number;
  notaApertura?: string;
}

export class OpenCashSessionUseCase {
  constructor(private readonly repository: CashRegisterRepository) {}

  async execute(input: OpenCashSessionInput): Promise<CashSessionEntity> {
    const register = await this.repository.findRegisterById(input.cashRegisterId);
    if (!register) throw new NotFoundError('Caja no encontrada', 'cashRegisterId');
    if (!register.activa) throw new BusinessRuleError(`${register.nombre} está desactivada`);

    const alreadyOpen = await this.repository.findOpenSessionByRegister(register.id);
    if (alreadyOpen) throw new BusinessRuleError(`${register.nombre} ya está abierta por ${alreadyOpen.cajero}`);

    if (input.base < 0) throw new ValidationError('La base no puede ser negativa', 'base');

    return this.repository.openSession({
      cashRegisterId: register.id,
      cajaNombre: register.nombre,
      cajero: input.cajero.trim(),
      base: roundMoney(input.base),
      notaApertura: input.notaApertura?.trim() || undefined,
    });
  }
}

export interface GetCashSessionsInput {
  estado?: CashSessionStatus;
  /** Días hacia atrás (incluye hoy). Las sesiones abiertas siempre se incluyen. */
  dias?: number;
}

export class GetCashSessionsUseCase {
  constructor(
    private readonly repository: CashRegisterRepository,
    private readonly activityReader: CashSessionActivityReader,
  ) {}

  async execute({ estado, dias = 7 }: GetCashSessionsInput): Promise<CashSessionSummary[]> {
    const sessions = await this.repository.findSessions({ estado, desde: lastDays(dias).from });
    const totals = await this.activityReader.getTotals(sessions.map((s) => s.id));
    return sessions.map((session) => toSummary(session, totals.get(session.id)));
  }
}

export class GetCashSessionDetailUseCase {
  constructor(
    private readonly repository: CashRegisterRepository,
    private readonly activityReader: CashSessionActivityReader,
  ) {}

  async execute(id: string): Promise<CashSessionDetail> {
    const session = await this.repository.findSessionById(id);
    if (!session) throw new NotFoundError('Sesión de caja no encontrada');

    const [totals, activity] = await Promise.all([
      this.activityReader.getTotals([id]),
      this.activityReader.getActivity(id),
    ]);

    const apertura: CashActivityItem = {
      fecha: session.abiertaEn,
      tipo: 'apertura',
      detalle: 'Base inicial',
      monto: session.base,
    };

    return { ...toSummary(session, totals.get(id)), actividad: [apertura, ...activity] };
  }
}

export class AddCashIncomeUseCase {
  constructor(
    private readonly repository: CashRegisterRepository,
    private readonly guard: CashSessionGuard,
  ) {}

  async execute(sessionId: string, concepto: string, monto: number): Promise<CashMovementEntity> {
    await this.guard.ensureOpen(sessionId);
    if (monto <= 0) throw new ValidationError('El monto debe ser mayor a cero', 'monto');
    return this.repository.addMovement(sessionId, concepto.trim(), roundMoney(monto));
  }
}

export interface CloseCashSessionInput {
  conteo: CashCountLine[];
  monedas: number;
  observacion?: string;
}

export class CloseCashSessionUseCase {
  constructor(
    private readonly repository: CashRegisterRepository,
    private readonly activityReader: CashSessionActivityReader,
    private readonly guard: CashSessionGuard,
  ) {}

  async execute(sessionId: string, input: CloseCashSessionInput): Promise<CashSessionEntity> {
    const session = await this.guard.ensureOpen(sessionId);
    const totals = (await this.activityReader.getTotals([sessionId])).get(sessionId) ?? emptyTotals();

    const conteo = input.conteo.filter((line) => line.cantidad > 0);
    const contado = roundMoney(countedCash(conteo, input.monedas));
    const esperado = roundMoney(expectedCash(session.base, totals));

    const closed = await this.repository.closeSession(sessionId, {
      conteo,
      monedas: input.monedas,
      contado,
      esperado,
      diferencia: contado - esperado,
      observacion: input.observacion?.trim() || undefined,
    });
    if (!closed) throw new NotFoundError('Sesión de caja no encontrada');
    return closed;
  }
}
