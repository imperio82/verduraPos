import type { CreateProductData, ProductEntity, ProductFilters, UpdateProductData } from '../entities/product.entity';

export interface PricingData {
  precioCompra: number;
  porcentajeGanancia: number;
  precioVenta: number;
}

export interface ProductRepository {
  findAll(filters?: ProductFilters): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
  findByIds(ids: string[]): Promise<ProductEntity[]>;
  existsByName(nombre: string, excludeId?: string): Promise<boolean>;
  create(data: CreateProductData): Promise<ProductEntity>;
  update(id: string, data: UpdateProductData): Promise<ProductEntity | null>;
  /** Suma (o resta, con delta negativo) al stock de forma atómica. */
  adjustStock(id: string, delta: number): Promise<void>;
  setStock(id: string, stock: number): Promise<void>;
  updatePricing(id: string, pricing: PricingData): Promise<void>;
}
