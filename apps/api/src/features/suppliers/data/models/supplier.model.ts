import { HydratedDocument, Schema } from 'mongoose';
import type { SupplierEntity } from '../../domain/entities/supplier.entity';

export const SUPPLIER_MODEL = 'Supplier';

export type SupplierDocument = HydratedDocument<Omit<SupplierEntity, 'id'>>;

export const SupplierSchema = new Schema<Omit<SupplierEntity, 'id'>>(
  {
    nombre: { type: String, required: true, trim: true },
    telefono: { type: String, trim: true },
    diasEntrega: { type: String, trim: true },
    notas: { type: String, trim: true },
    activo: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, collection: 'proveedores' },
);

SupplierSchema.index({ nombre: 1 }, { unique: true, collation: { locale: 'es', strength: 2 } });

export const toSupplierEntity = (doc: SupplierDocument): SupplierEntity => ({
  id: doc._id.toString(),
  nombre: doc.nombre,
  telefono: doc.telefono,
  diasEntrega: doc.diasEntrega,
  notas: doc.notas,
  activo: doc.activo,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
