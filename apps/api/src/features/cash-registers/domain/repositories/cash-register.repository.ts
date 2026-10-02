import type {
  CashActivityItem,
  CashClosing,
  CashMovementEntity,
  CashRegisterEntity,
  CashSessionEntity,
  CashSessionStatus,
  CashSessionTotals,
} from '../entities/cash-register.entity';

export interface CashSessionFilters {
  estado?: CashSessionStatus;
  desde?: Date;
}

export interface OpenSessionData {
  cashRegisterId: string;
  cajaNombre: string;
  cajero: string;
  base: number;
  notaApertura?: string;
}

export interface CashRegisterRepository {
  // Cajas
  findRegisters(): Promise<CashRegisterEntity[]>;
  findRegisterById(id: string): Promise<CashRegisterEntity | null>;
  registerExistsByName(nombre: string): Promise<boolean>;
  createRegister(nombre: string): Promise<CashRegisterEntity>;

  // Sesiones
  findSessions(filters: CashSessionFilters): Promise<CashSessionEntity[]>;
  findSessionById(id: string): Promise<CashSessionEntity | null>;
  findOpenSessionByRegister(cashRegisterId: string): Promise<CashSessionEntity | null>;
  openSession(data: OpenSessionData): Promise<CashSessionEntity>;
  closeSession(id: string, cierre: CashClosing): Promise<CashSessionEntity | null>;

  // Movimientos propios de caja (otros ingresos)
  addMovement(sessionId: string, concepto: string, monto: number): Promise<CashMovementEntity>;
}

/**
 * Puerto de lectura: totales y actividad de una sesión. Se alimenta de ventas,
 * gastos y ahorros, que viven en otras features, por eso es un read-model aparte.
 */
export interface CashSessionActivityReader {
  getTotals(sessionIds: string[]): Promise<Map<string, CashSessionTotals>>;
  getActivity(sessionId: string): Promise<CashActivityItem[]>;
}
