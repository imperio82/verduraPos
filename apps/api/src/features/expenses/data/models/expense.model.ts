import { HydratedDocument, Schema, Types } from 'mongoose';
import { COLLECTIONS } from '@/core/constants/collections';
import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS, type ExpenseEntity } from '../../domain/entities/expense.entity';

export const EXPENSE_MODEL = 'Expense';

export interface ExpenseRecord extends Omit<ExpenseEntity, 'id' | 'cashSessionId'> {
  cashSessionId?: Types.ObjectId;
}
export type ExpenseDocument = HydratedDocument<ExpenseRecord>;

export const ExpenseSchema = new Schema<ExpenseRecord>(
  {
    concepto: { type: String, required: true, trim: true },
    destino: { type: String, required: true, enum: EXPENSE_CATEGORIES },
    monto: { type: Number, required: true, min: 0 },
    metodoPago: { type: String, enum: EXPENSE_PAYMENT_METHODS, default: 'efectivo' },
    cashSessionId: { type: Schema.Types.ObjectId, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: COLLECTIONS.expenses },
);
ExpenseSchema.index({ createdAt: -1 });

export const toExpenseEntity = (doc: ExpenseDocument): ExpenseEntity => ({
  id: doc._id.toString(),
  concepto: doc.concepto,
  destino: doc.destino,
  monto: doc.monto,
  metodoPago: doc.metodoPago ?? 'efectivo',
  cashSessionId: doc.cashSessionId?.toString(),
  createdAt: doc.createdAt,
});
