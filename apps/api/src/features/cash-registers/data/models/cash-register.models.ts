import { HydratedDocument, Schema, Types } from 'mongoose';
import { COLLECTIONS } from '@/core/constants/collections';
import type {
  CashClosing,
  CashMovementEntity,
  CashRegisterEntity,
  CashSessionEntity,
} from '../../domain/entities/cash-register.entity';

export const CASH_REGISTER_MODEL = 'CashRegister';
export const CASH_SESSION_MODEL = 'CashSession';
export const CASH_MOVEMENT_MODEL = 'CashMovement';

// ---------- Caja ----------
export interface CashRegisterRecord {
  nombre: string;
  activa: boolean;
  createdAt: Date;
}
export type CashRegisterDocument = HydratedDocument<CashRegisterRecord>;

export const CashRegisterSchema = new Schema<CashRegisterRecord>(
  {
    nombre: { type: String, required: true, trim: true },
    activa: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, collection: COLLECTIONS.cashRegisters },
);
CashRegisterSchema.index({ nombre: 1 }, { unique: true, collation: { locale: 'es', strength: 2 } });

export const toCashRegisterEntity = (doc: CashRegisterDocument): CashRegisterEntity => ({
  id: doc._id.toString(),
  nombre: doc.nombre,
  activa: doc.activa,
  createdAt: doc.createdAt,
});

// ---------- Sesión de caja ----------
export interface CashSessionRecord extends Omit<CashSessionEntity, 'id' | 'cashRegisterId'> {
  cashRegisterId: Types.ObjectId;
}
export type CashSessionDocument = HydratedDocument<CashSessionRecord>;

const CashClosingSchema = new Schema<CashClosing>(
  {
    conteo: [{ _id: false, denominacion: Number, cantidad: Number }],
    monedas: { type: Number, default: 0 },
    contado: { type: Number, required: true },
    esperado: { type: Number, required: true },
    diferencia: { type: Number, required: true },
    observacion: String,
  },
  { _id: false },
);

export const CashSessionSchema = new Schema<CashSessionRecord>(
  {
    cashRegisterId: { type: Schema.Types.ObjectId, required: true, ref: CASH_REGISTER_MODEL },
    cajaNombre: { type: String, required: true },
    cajero: { type: String, required: true, trim: true },
    base: { type: Number, required: true, min: 0 },
    notaApertura: String,
    estado: { type: String, required: true, enum: ['abierta', 'cerrada'], default: 'abierta' },
    abiertaEn: { type: Date, required: true, default: () => new Date() },
    cerradaEn: Date,
    cierre: CashClosingSchema,
  },
  { collection: COLLECTIONS.cashSessions },
);
CashSessionSchema.index({ estado: 1, abiertaEn: -1 });
CashSessionSchema.index({ cashRegisterId: 1, estado: 1 });

export const toCashSessionEntity = (doc: CashSessionDocument): CashSessionEntity => ({
  id: doc._id.toString(),
  cashRegisterId: doc.cashRegisterId.toString(),
  cajaNombre: doc.cajaNombre,
  cajero: doc.cajero,
  base: doc.base,
  notaApertura: doc.notaApertura,
  estado: doc.estado,
  abiertaEn: doc.abiertaEn,
  cerradaEn: doc.cerradaEn,
  cierre: doc.cierre
    ? {
        conteo: doc.cierre.conteo.map(({ denominacion, cantidad }) => ({ denominacion, cantidad })),
        monedas: doc.cierre.monedas,
        contado: doc.cierre.contado,
        esperado: doc.cierre.esperado,
        diferencia: doc.cierre.diferencia,
        observacion: doc.cierre.observacion,
      }
    : undefined,
});

// ---------- Movimiento de caja (otros ingresos) ----------
export interface CashMovementRecord extends Omit<CashMovementEntity, 'id' | 'sessionId'> {
  sessionId: Types.ObjectId;
}
export type CashMovementDocument = HydratedDocument<CashMovementRecord>;

export const CashMovementSchema = new Schema<CashMovementRecord>(
  {
    sessionId: { type: Schema.Types.ObjectId, required: true, ref: CASH_SESSION_MODEL, index: true },
    tipo: { type: String, required: true, enum: ['ingreso'], default: 'ingreso' },
    concepto: { type: String, required: true, trim: true },
    monto: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: COLLECTIONS.cashMovements },
);

export const toCashMovementEntity = (doc: CashMovementDocument): CashMovementEntity => ({
  id: doc._id.toString(),
  sessionId: doc.sessionId.toString(),
  tipo: doc.tipo,
  concepto: doc.concepto,
  monto: doc.monto,
  createdAt: doc.createdAt,
});
