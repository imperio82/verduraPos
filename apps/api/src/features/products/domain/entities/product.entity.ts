export const PRODUCT_CATEGORIES = ['frutas', 'verduras', 'raices', 'hierbas'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_UNITS = ['kg', 'und', 'manojo'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export interface ProductEntity {
  id: string;
  nombre: string;
  codigo?: string;
  categoria: ProductCategory;
  unidad: ProductUnit;
  /** Último precio de compra. */
  precioCompra: number;
  porcentajeGanancia: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  /** Color para el ícono del producto en el POS. */
  color: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProductData = Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductData = Partial<CreateProductData>;

export interface ProductFilters {
  categoria?: ProductCategory;
  search?: string;
  soloActivos?: boolean;
}

export const isLowStock = (product: Pick<ProductEntity, 'stock' | 'stockMinimo'>): boolean =>
  product.stock <= product.stockMinimo;
