import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, type FilterQuery } from 'mongoose';
import type { CreateProductData, ProductEntity, ProductFilters, UpdateProductData } from '../../domain/entities/product.entity';
import { PRODUCT_MODEL, type ProductDocument } from '../models/product.model';

export interface ProductDataSource {
  find(filters: ProductFilters): Promise<ProductDocument[]>;
  findById(id: string): Promise<ProductDocument | null>;
  findByIds(ids: string[]): Promise<ProductDocument[]>;
  existsByName(nombre: string, excludeId?: string): Promise<boolean>;
  create(data: CreateProductData): Promise<ProductDocument>;
  update(id: string, data: UpdateProductData): Promise<ProductDocument | null>;
  incrementStock(id: string, delta: number): Promise<void>;
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const CASE_INSENSITIVE = { locale: 'es', strength: 2 } as const;

@Injectable()
export class MongoProductDataSource implements ProductDataSource {
  constructor(@InjectModel(PRODUCT_MODEL) private readonly model: Model<Omit<ProductEntity, 'id'>>) {}

  find({ categoria, search, soloActivos }: ProductFilters): Promise<ProductDocument[]> {
    const query: FilterQuery<ProductEntity> = {};
    if (categoria) query.categoria = categoria;
    if (soloActivos) query.activo = true;
    if (search?.trim()) {
      const pattern = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [{ nombre: pattern }, { codigo: pattern }];
    }
    return this.model.find(query).sort({ nombre: 1 }).collation(CASE_INSENSITIVE).exec();
  }

  findById(id: string): Promise<ProductDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.model.findById(id).exec();
  }

  findByIds(ids: string[]): Promise<ProductDocument[]> {
    return this.model.find({ _id: { $in: ids.filter(isValidObjectId) } }).exec();
  }

  async existsByName(nombre: string, excludeId?: string): Promise<boolean> {
    const query: FilterQuery<ProductEntity> = { nombre };
    if (excludeId && isValidObjectId(excludeId)) query._id = { $ne: excludeId };
    const found = await this.model.findOne(query).collation(CASE_INSENSITIVE).select('_id').lean().exec();
    return found !== null;
  }

  create(data: CreateProductData): Promise<ProductDocument> {
    return this.model.create(data);
  }

  update(id: string, data: UpdateProductData): Promise<ProductDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.model.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  async incrementStock(id: string, delta: number): Promise<void> {
    await this.model.updateOne({ _id: id }, { $inc: { stock: delta } }).exec();
  }
}
