import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, type FilterQuery } from 'mongoose';
import type { CreateSupplierData, SupplierEntity, UpdateSupplierData } from '../../domain/entities/supplier.entity';
import { SUPPLIER_MODEL, type SupplierDocument } from '../models/supplier.model';

export interface SupplierDataSource {
  findAll(): Promise<SupplierDocument[]>;
  findById(id: string): Promise<SupplierDocument | null>;
  existsByName(nombre: string, excludeId?: string): Promise<boolean>;
  create(data: CreateSupplierData): Promise<SupplierDocument>;
  update(id: string, data: UpdateSupplierData): Promise<SupplierDocument | null>;
}

@Injectable()
export class MongoSupplierDataSource implements SupplierDataSource {
  constructor(@InjectModel(SUPPLIER_MODEL) private readonly model: Model<Omit<SupplierEntity, 'id'>>) {}

  findAll(): Promise<SupplierDocument[]> {
    return this.model.find({ activo: true }).sort({ nombre: 1 }).exec();
  }

  findById(id: string): Promise<SupplierDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.model.findById(id).exec();
  }

  async existsByName(nombre: string, excludeId?: string): Promise<boolean> {
    const query: FilterQuery<SupplierEntity> = { nombre };
    if (excludeId && isValidObjectId(excludeId)) query._id = { $ne: excludeId };
    const found = await this.model.findOne(query).collation({ locale: 'es', strength: 2 }).select('_id').lean().exec();
    return found !== null;
  }

  create(data: CreateSupplierData): Promise<SupplierDocument> {
    return this.model.create(data);
  }

  update(id: string, data: UpdateSupplierData): Promise<SupplierDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.model.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }
}
