import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types, type FilterQuery } from 'mongoose';
import type { CashClosing } from '../../domain/entities/cash-register.entity';
import type { CashSessionFilters, OpenSessionData } from '../../domain/repositories/cash-register.repository';
import {
  CASH_MOVEMENT_MODEL,
  CASH_REGISTER_MODEL,
  CASH_SESSION_MODEL,
  type CashMovementDocument,
  type CashMovementRecord,
  type CashRegisterDocument,
  type CashRegisterRecord,
  type CashSessionDocument,
  type CashSessionRecord,
} from '../models/cash-register.models';

export interface CashRegisterDataSource {
  findRegisters(): Promise<CashRegisterDocument[]>;
  findRegisterById(id: string): Promise<CashRegisterDocument | null>;
  registerExistsByName(nombre: string): Promise<boolean>;
  createRegister(nombre: string): Promise<CashRegisterDocument>;
  findSessions(filters: CashSessionFilters): Promise<CashSessionDocument[]>;
  findSessionById(id: string): Promise<CashSessionDocument | null>;
  findOpenSessionByRegister(cashRegisterId: string): Promise<CashSessionDocument | null>;
  createSession(data: OpenSessionData): Promise<CashSessionDocument>;
  closeSession(id: string, cierre: CashClosing): Promise<CashSessionDocument | null>;
  createMovement(sessionId: string, concepto: string, monto: number): Promise<CashMovementDocument>;
}

@Injectable()
export class MongoCashRegisterDataSource implements CashRegisterDataSource {
  constructor(
    @InjectModel(CASH_REGISTER_MODEL) private readonly registers: Model<CashRegisterRecord>,
    @InjectModel(CASH_SESSION_MODEL) private readonly sessions: Model<CashSessionRecord>,
    @InjectModel(CASH_MOVEMENT_MODEL) private readonly movements: Model<CashMovementRecord>,
  ) {}

  findRegisters(): Promise<CashRegisterDocument[]> {
    return this.registers.find({ activa: true }).sort({ nombre: 1 }).exec();
  }

  findRegisterById(id: string): Promise<CashRegisterDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.registers.findById(id).exec();
  }

  async registerExistsByName(nombre: string): Promise<boolean> {
    const found = await this.registers
      .findOne({ nombre })
      .collation({ locale: 'es', strength: 2 })
      .select('_id')
      .lean()
      .exec();
    return found !== null;
  }

  createRegister(nombre: string): Promise<CashRegisterDocument> {
    return this.registers.create({ nombre });
  }

  findSessions({ estado, desde }: CashSessionFilters): Promise<CashSessionDocument[]> {
    const query: FilterQuery<CashSessionRecord> = {};
    if (estado) query.estado = estado;
    // Las sesiones abiertas se muestran siempre, sin importar la fecha.
    if (desde) query.$or = [{ estado: 'abierta' }, { abiertaEn: { $gte: desde } }];
    return this.sessions.find(query).sort({ estado: 1, abiertaEn: -1 }).exec();
  }

  findSessionById(id: string): Promise<CashSessionDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.sessions.findById(id).exec();
  }

  findOpenSessionByRegister(cashRegisterId: string): Promise<CashSessionDocument | null> {
    return this.sessions.findOne({ cashRegisterId: new Types.ObjectId(cashRegisterId), estado: 'abierta' }).exec();
  }

  createSession(data: OpenSessionData): Promise<CashSessionDocument> {
    return this.sessions.create({
      ...data,
      cashRegisterId: new Types.ObjectId(data.cashRegisterId),
      estado: 'abierta',
      abiertaEn: new Date(),
    });
  }

  closeSession(id: string, cierre: CashClosing): Promise<CashSessionDocument | null> {
    return this.sessions
      .findOneAndUpdate(
        { _id: id, estado: 'abierta' },
        { $set: { estado: 'cerrada', cerradaEn: new Date(), cierre } },
        { new: true },
      )
      .exec();
  }

  createMovement(sessionId: string, concepto: string, monto: number): Promise<CashMovementDocument> {
    return this.movements.create({ sessionId: new Types.ObjectId(sessionId), tipo: 'ingreso', concepto, monto });
  }
}
