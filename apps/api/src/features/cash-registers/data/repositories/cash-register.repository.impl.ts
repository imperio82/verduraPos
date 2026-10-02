import type {
  CashClosing,
  CashMovementEntity,
  CashRegisterEntity,
  CashSessionEntity,
} from '../../domain/entities/cash-register.entity';
import type {
  CashRegisterRepository,
  CashSessionFilters,
  OpenSessionData,
} from '../../domain/repositories/cash-register.repository';
import type { CashRegisterDataSource } from '../datasources/cash-register.datasource';
import { toCashMovementEntity, toCashRegisterEntity, toCashSessionEntity } from '../models/cash-register.models';

export class CashRegisterRepositoryImpl implements CashRegisterRepository {
  constructor(private readonly dataSource: CashRegisterDataSource) {}

  async findRegisters(): Promise<CashRegisterEntity[]> {
    return (await this.dataSource.findRegisters()).map(toCashRegisterEntity);
  }

  async findRegisterById(id: string): Promise<CashRegisterEntity | null> {
    const doc = await this.dataSource.findRegisterById(id);
    return doc ? toCashRegisterEntity(doc) : null;
  }

  registerExistsByName(nombre: string): Promise<boolean> {
    return this.dataSource.registerExistsByName(nombre);
  }

  async createRegister(nombre: string): Promise<CashRegisterEntity> {
    return toCashRegisterEntity(await this.dataSource.createRegister(nombre));
  }

  async findSessions(filters: CashSessionFilters): Promise<CashSessionEntity[]> {
    return (await this.dataSource.findSessions(filters)).map(toCashSessionEntity);
  }

  async findSessionById(id: string): Promise<CashSessionEntity | null> {
    const doc = await this.dataSource.findSessionById(id);
    return doc ? toCashSessionEntity(doc) : null;
  }

  async findOpenSessionByRegister(cashRegisterId: string): Promise<CashSessionEntity | null> {
    const doc = await this.dataSource.findOpenSessionByRegister(cashRegisterId);
    return doc ? toCashSessionEntity(doc) : null;
  }

  async openSession(data: OpenSessionData): Promise<CashSessionEntity> {
    return toCashSessionEntity(await this.dataSource.createSession(data));
  }

  async closeSession(id: string, cierre: CashClosing): Promise<CashSessionEntity | null> {
    const doc = await this.dataSource.closeSession(id, cierre);
    return doc ? toCashSessionEntity(doc) : null;
  }

  async addMovement(sessionId: string, concepto: string, monto: number): Promise<CashMovementEntity> {
    return toCashMovementEntity(await this.dataSource.createMovement(sessionId, concepto, monto));
  }
}
