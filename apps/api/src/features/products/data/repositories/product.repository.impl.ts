import { roundQuantity } from '@/core';
import type { CreateProductData, ProductEntity, ProductFilters, UpdateProductData } from '../../domain/entities/product.entity';
import type { PricingData, ProductRepository } from '../../domain/repositories/product.repository';
import type { ProductDataSource } from '../datasources/product.datasource';
import { toProductEntity } from '../models/product.model';

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly dataSource: ProductDataSource) {}

  async findAll(filters: ProductFilters = {}): Promise<ProductEntity[]> {
    const docs = await this.dataSource.find(filters);
    return docs.map(toProductEntity);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const doc = await this.dataSource.findById(id);
    return doc ? toProductEntity(doc) : null;
  }

  async findByIds(ids: string[]): Promise<ProductEntity[]> {
    const docs = await this.dataSource.findByIds(ids);
    return docs.map(toProductEntity);
  }

  existsByName(nombre: string, excludeId?: string): Promise<boolean> {
    return this.dataSource.existsByName(nombre, excludeId);
  }

  async create(data: CreateProductData): Promise<ProductEntity> {
    return toProductEntity(await this.dataSource.create(data));
  }

  async update(id: string, data: UpdateProductData): Promise<ProductEntity | null> {
    const doc = await this.dataSource.update(id, data);
    return doc ? toProductEntity(doc) : null;
  }

  adjustStock(id: string, delta: number): Promise<void> {
    return this.dataSource.incrementStock(id, roundQuantity(delta));
  }

  async setStock(id: string, stock: number): Promise<void> {
    await this.dataSource.update(id, { stock: roundQuantity(stock) });
  }

  async updatePricing(id: string, pricing: PricingData): Promise<void> {
    await this.dataSource.update(id, pricing);
  }
}
