import { HydratedDocument, Schema, Types } from 'mongoose';
import { COLLECTIONS } from '@/core/constants/collections';
import { SAVINGS_PERIODS, type SavingsDepositEntity, type SavingsGoalEntity } from '../../domain/entities/savings.entity';

export const SAVINGS_GOAL_MODEL = 'SavingsGoal';
export const SAVINGS_DEPOSIT_MODEL = 'SavingsDeposit';

export type SavingsGoalRecord = Omit<SavingsGoalEntity, 'id'>;
export type SavingsGoalDocument = HydratedDocument<SavingsGoalRecord>;

export const SavingsGoalSchema = new Schema<SavingsGoalRecord>(
  {
    nombre: { type: String, required: true, trim: true },
    meta: { type: Number, required: true, min: 0 },
    periodo: { type: String, enum: SAVINGS_PERIODS, default: 'mensual' },
    aportePeriodo: { type: Number, min: 0 },
    activa: { type: Boolean, required: true, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: COLLECTIONS.savingsGoals },
);

export const toSavingsGoalEntity = (doc: SavingsGoalDocument): SavingsGoalEntity => ({
  id: doc._id.toString(),
  nombre: doc.nombre,
  meta: doc.meta,
  periodo: doc.periodo ?? 'mensual',
  // Metas creadas antes de existir la cuota: se reparte la meta en un año.
  aportePeriodo: doc.aportePeriodo ?? Math.round(doc.meta / 12),
  activa: doc.activa,
  createdAt: doc.createdAt,
});

export interface SavingsDepositRecord extends Omit<SavingsDepositEntity, 'id' | 'goalId' | 'cashSessionId'> {
  goalId: Types.ObjectId;
  cashSessionId?: Types.ObjectId;
}
export type SavingsDepositDocument = HydratedDocument<SavingsDepositRecord>;

export const SavingsDepositSchema = new Schema<SavingsDepositRecord>(
  {
    goalId: { type: Schema.Types.ObjectId, required: true, index: true },
    goalNombre: { type: String, required: true },
    monto: { type: Number, required: true, min: 0 },
    cashSessionId: { type: Schema.Types.ObjectId, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: COLLECTIONS.savingsDeposits },
);

export const toSavingsDepositEntity = (doc: SavingsDepositDocument): SavingsDepositEntity => ({
  id: doc._id.toString(),
  goalId: doc.goalId.toString(),
  goalNombre: doc.goalNombre,
  monto: doc.monto,
  cashSessionId: doc.cashSessionId?.toString(),
  createdAt: doc.createdAt,
});
