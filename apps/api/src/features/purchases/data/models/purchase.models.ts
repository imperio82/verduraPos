import { HydratedDocument, Schema, Types } from 'mongoose';
import { COLLECTIONS } from '@/core/constants/collections';
import { PRODUCT_UNITS } from '@/features/products/domain/entities/product.entity';
import {
  PURCHASE_ITEM_STATUSES,
  PURCHASE_STATUSES,
  type PurchaseEntity,
  type PurchaseItem,
} from '../../domain/entities/purchase.entity';

export const PURCHASE_MODEL = 'Purchase';

export interface PurchaseItemRecord extends Omit<PurchaseItem, 'productId'> {
  productId: Types.ObjectId;
}
export interface PurchaseRecord extends Omit<PurchaseEntity, 'id' | 'supplierId' | 'items'> {
  supplierId: Types.ObjectId;
  items: PurchaseItemRecord[];
}
export type PurchaseDocument = HydratedDocument<PurchaseRecord>;

const PurchaseItemSchema = new Schema<PurchaseItemRecord>(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    nombre: { type: String, required: true },
    unidad: { type: String, required: true, enum: PRODUCT_UNITS },
    cantidad: { type: Number, required: true },
    precioCompra: { type: Number, required: true },
    porcentajeGanancia: { type: Number, required: true },
    precioVenta: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    cantidadRecibida: Number,
    cantidadMala: Number,
    estado: { type: String, enum: PURCHASE_ITEM_STATUSES },
  },
  { _id: false },
);

export const PurchaseSchema = new Schema<PurchaseRecord>(
  {
    codigo: { type: String, required: true, unique: true },
    supplierId: { type: Schema.Types.ObjectId, required: true, index: true },
    proveedorNombre: { type: String, required: true },
    numeroFactura: String,
    fechaFactura: Date,
    fechaEntrega: { type: Date, required: true },
    porcentajeGananciaGeneral: { type: Number, required: true },
    items: { type: [PurchaseItemSchema], default: [] },
    total: { type: Number, required: true },
    totalRecibido: Number,
    estado: { type: String, required: true, enum: PURCHASE_STATUSES, default: 'por_llegar' },
    nota: String,
    notaLlegada: String,
    recibidaEn: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: COLLECTIONS.purchases },
);
PurchaseSchema.index({ supplierId: 1, createdAt: -1 });
PurchaseSchema.index({ estado: 1, fechaEntrega: 1 });

export const toPurchaseEntity = (doc: PurchaseDocument): PurchaseEntity => ({
  id: doc._id.toString(),
  codigo: doc.codigo,
  supplierId: doc.supplierId.toString(),
  proveedorNombre: doc.proveedorNombre,
  numeroFactura: doc.numeroFactura,
  fechaFactura: doc.fechaFactura,
  fechaEntrega: doc.fechaEntrega,
  porcentajeGananciaGeneral: doc.porcentajeGananciaGeneral,
  items: doc.items.map((item) => ({
    productId: item.productId.toString(),
    nombre: item.nombre,
    unidad: item.unidad,
    cantidad: item.cantidad,
    precioCompra: item.precioCompra,
    porcentajeGanancia: item.porcentajeGanancia,
    precioVenta: item.precioVenta,
    subtotal: item.subtotal,
    cantidadRecibida: item.cantidadRecibida,
    cantidadMala: item.cantidadMala,
    estado: item.estado,
  })),
  total: doc.total,
  totalRecibido: doc.totalRecibido,
  estado: doc.estado,
  nota: doc.nota,
  notaLlegada: doc.notaLlegada,
  recibidaEn: doc.recibidaEn,
  createdAt: doc.createdAt,
});
