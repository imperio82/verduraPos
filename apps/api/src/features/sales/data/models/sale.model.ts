import { HydratedDocument, Schema, Types } from 'mongoose';
import { COLLECTIONS, PAYMENT_METHODS } from '@/core/constants/collections';
import { PRODUCT_UNITS } from '@/features/products/domain/entities/product.entity';
import type { SaleEntity, SaleItem } from '../../domain/entities/sale.entity';

export const SALE_MODEL = 'Sale';

export interface SaleItemRecord extends Omit<SaleItem, 'productId'> {
  productId: Types.ObjectId;
}

export interface SaleRecord extends Omit<SaleEntity, 'id' | 'cashSessionId' | 'items'> {
  cashSessionId: Types.ObjectId;
  items: SaleItemRecord[];
}
export type SaleDocument = HydratedDocument<SaleRecord>;

const SaleItemSchema = new Schema<SaleItemRecord>(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    nombre: { type: String, required: true },
    unidad: { type: String, required: true, enum: PRODUCT_UNITS },
    cantidad: { type: Number, required: true },
    precioUnitario: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
);

export const SaleSchema = new Schema<SaleRecord>(
  {
    numero: { type: Number, required: true, unique: true },
    cashSessionId: { type: Schema.Types.ObjectId, required: true, index: true },
    cajaNombre: { type: String, required: true },
    cajero: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['productos', 'total'] },
    items: { type: [SaleItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    descuento: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    metodoPago: { type: String, required: true, enum: PAYMENT_METHODS },
    nota: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: COLLECTIONS.sales },
);
SaleSchema.index({ createdAt: -1 });

export const toSaleEntity = (doc: SaleDocument): SaleEntity => ({
  id: doc._id.toString(),
  numero: doc.numero,
  cashSessionId: doc.cashSessionId.toString(),
  cajaNombre: doc.cajaNombre,
  cajero: doc.cajero,
  tipo: doc.tipo,
  items: doc.items.map((item) => ({
    productId: item.productId.toString(),
    nombre: item.nombre,
    unidad: item.unidad,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    total: item.total,
  })),
  subtotal: doc.subtotal,
  descuento: doc.descuento,
  total: doc.total,
  metodoPago: doc.metodoPago,
  nota: doc.nota,
  createdAt: doc.createdAt,
});

