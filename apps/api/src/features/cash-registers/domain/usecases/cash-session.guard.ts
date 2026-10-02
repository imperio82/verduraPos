import { BusinessRuleError, NotFoundError, ResponseCodes } from '@/core';
import type { CashSessionEntity } from '../entities/cash-register.entity';
import type { CashRegisterRepository } from '../repositories/cash-register.repository';

/**
 * Servicio de dominio que otras features (ventas, gastos, dañados, ahorro) usan
 * para ligar sus registros a una caja abierta: así el cierre refleja todo lo
 * que pasó en el turno.
 */
export class CashSessionGuard {
  constructor(private readonly repository: CashRegisterRepository) {}

  async ensureOpen(sessionId: string): Promise<CashSessionEntity> {
    const session = await this.repository.findSessionById(sessionId);
    if (!session) throw new NotFoundError('Sesión de caja no encontrada', 'cashSessionId');
    if (session.estado !== 'abierta') {
      throw new BusinessRuleError(`${session.cajaNombre} está cerrada`, ResponseCodes.CASH_SESSION_CLOSED, 'cashSessionId');
    }
    return session;
  }

  /**
   * La caja indicada (debe estar abierta) o, si no se indica, la última caja
   * que se abrió. Sin caja abierta no se puede registrar nada del día.
   */
  async resolveOpen(sessionId?: string): Promise<CashSessionEntity> {
    if (sessionId) return this.ensureOpen(sessionId);
    const [latest] = await this.repository.findSessions({ estado: 'abierta' });
    if (!latest) {
      throw new BusinessRuleError(
        'Abre una caja antes de registrar movimientos del día',
        ResponseCodes.NO_OPEN_CASH_SESSION,
        'cashSessionId',
      );
    }
    return latest;
  }
}
