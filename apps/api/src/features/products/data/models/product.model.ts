import { HydratedDocument, Schema } from 'mongoose';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS, type ProductEntity } from '../../domain/entities/product.entity';

export const PRODUCT_MODEL = 'Product';

export type ProductDocument = HydratedDocument<Omit<ProductEntity, 'id'>>;

export const ProductSchema = new Schema<Omit<ProductEntity, 'id'>>(
  {
    nombre: { type: String, required: true, trim: true },
    codigo: { type: String, trim: true },
    categoria: { type: String, required: true, enum: PRODUCT_CATEGORIES },
    unidad: { type: String, required: true, enum: PRODUCT_UNITS },
    precioCompra: { type: Number, required: true, min: 0, default: 0 },
    porcentajeGanancia: { type: Number, required: true, min: 0, default: 50 },
    precioVenta: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0 },
    stockMinimo: { type: Number, required: true, min: 0, default: 0 },
    color: { type: String, required: true, default: '#3E9B3E' },
    activo: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, collection: 'productos' },
);

ProductSchema.index({ nombre: 1 }, { unique: true, collation: { locale: 'es', strength: 2 } });
ProductSchema.index({ categoria: 1, activo: 1 });

export const toProductEntity = (doc: ProductDocument): ProductEntity => ({
  id: doc._id.toString(),
  nombre: doc.nombre,
  codigo: doc.codigo,
  categoria: doc.categoria,
  unidad: doc.unidad,
  precioCompra: doc.precioCompra,
  porcentajeGanancia: doc.porcentajeGanancia,
  precioVenta: doc.precioVenta,
  stock: doc.stock,
  stockMinimo: doc.stockMinimo,
  color: doc.color,
  activo: doc.activo,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
