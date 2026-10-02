import { HydratedDocument, Schema, Types } from 'mongoose';
import { COLLECTIONS } from '@/core/constants/collections';
import { PRODUCT_UNITS } from '@/features/products/domain/entities/product.entity';
import type { DamageEntity, RecountEntity, RecountItem } from '../../domain/entities/inventory.entity';

export const RECOUNT_MODEL = 'Recount';
export const DAMAGE_MODEL = 'Damage';

// ---------- Reconteo ----------
export interface RecountItemRecord extends Omit<RecountItem, 'productId'> {
  productId: Types.ObjectId;
}
export interface RecountRecord extends Omit<RecountEntity, 'id' | 'items' | 'cashSessionId'> {
  items: RecountItemRecord[];
  cashSessionId?: Types.ObjectId;
}
export type RecountDocument = HydratedDocument<RecountRecord>;

export const RecountSchema = new Schema<RecountRecord>(
  {
    items: [
      {
        _id: false,
        productId: { type: Schema.Types.ObjectId, required: true },
        nombre: { type: String, required: true },
        unidad: { type: String, required: true, enum: PRODUCT_UNITS },
        sistema: { type: Number, required: true },
        contado: { type: Number, required: true },
        diferencia: { type: Number, required: true },
      },
    ],
    nota: String,
    cashSessionId: { type: Schema.Types.ObjectId, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: COLLECTIONS.recounts },
);

export const toRecountEntity = (doc: RecountDocument): RecountEntity => ({
  id: doc._id.toString(),
  items: doc.items.map((item) => ({
    productId: item.productId.toString(),
    nombre: item.nombre,
    unidad: item.unidad,
    sistema: item.sistema,
    contado: item.contado,
    diferencia: item.diferencia,
  })),
  nota: doc.nota,
  cashSessionId: doc.cashSessionId?.toString(),
  createdAt: doc.createdAt,
});

// ---------- Dañado ----------
export interface DamageRecord extends Omit<DamageEntity, 'id' | 'productId' | 'cashSessionId'> {
  productId: Types.ObjectId;
  cashSessionId?: Types.ObjectId;
}
export type DamageDocument = HydratedDocument<DamageRecord>;

export const DamageSchema = new Schema<DamageRecord>(
  {
    productId: { type: Schema.Types.ObjectId, required: true, index: true },
    nombre: { type: String, required: true },
    unidad: { type: String, required: true, enum: PRODUCT_UNITS },
    cantidad: { type: Number, required: true, min: 0 },
    costo: { type: Number, required: true, min: 0 },
    motivo: String,
    cashSessionId: { type: Schema.Types.ObjectId, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: COLLECTIONS.damages },
);
DamageSchema.index({ createdAt: -1 });

export const toDamageEntity = (doc: DamageDocument): DamageEntity => ({
  id: doc._id.toString(),
  productId: doc.productId.toString(),
  nombre: doc.nombre,
  unidad: doc.unidad,
  cantidad: doc.cantidad,
  costo: doc.costo,
  motivo: doc.motivo,
  cashSessionId: doc.cashSessionId?.toString(),
  createdAt: doc.createdAt,
});
