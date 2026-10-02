import { ConflictError } from '@/core';
import type { CashRegisterEntity, CashSessionEntity } from '../entities/cash-register.entity';
import type { CashRegisterRepository } from '../repositories/cash-register.repository';

export interface CashRegisterWithStatus extends CashRegisterEntity {
  sesionAbierta: CashSessionEntity | null;
}

export class GetCashRegistersUseCase {
  constructor(private readonly repository: CashRegisterRepository) {}

  async execute(): Promise<CashRegisterWithStatus[]> {
    const [registers, openSessions] = await Promise.all([
      this.repository.findRegisters(),
      this.repository.findSessions({ estado: 'abierta' }),
    ]);
    return registers.map((register) => ({
      ...register,
      sesionAbierta: openSessions.find((s) => s.cashRegisterId === register.id) ?? null,
    }));
  }
}

export class CreateCashRegisterUseCase {
  constructor(private readonly repository: CashRegisterRepository) {}

  async execute(nombre: string): Promise<CashRegisterEntity> {
    const clean = nombre.trim();
    if (await this.repository.registerExistsByName(clean)) {
      throw new ConflictError(`Ya existe una caja llamada "${clean}"`, 'nombre');
    }
    return this.repository.createRegister(clean);
  }
}
