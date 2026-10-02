import type { CreateSupplierData, SupplierEntity, UpdateSupplierData } from '../../domain/entities/supplier.entity';
import type { SupplierRepository } from '../../domain/repositories/supplier.repository';
import type { SupplierDataSource } from '../datasources/supplier.datasource';
import { toSupplierEntity } from '../models/supplier.model';

export class SupplierRepositoryImpl implements SupplierRepository {
  constructor(private readonly dataSource: SupplierDataSource) {}

  async findAll(): Promise<SupplierEntity[]> {
    return (await this.dataSource.findAll()).map(toSupplierEntity);
  }

  async findById(id: string): Promise<SupplierEntity | null> {
    const doc = await this.dataSource.findById(id);
    return doc ? toSupplierEntity(doc) : null;
  }

  existsByName(nombre: string, excludeId?: string): Promise<boolean> {
    return this.dataSource.existsByName(nombre, excludeId);
  }

  async create(data: CreateSupplierData): Promise<SupplierEntity> {
    return toSupplierEntity(await this.dataSource.create(data));
  }

  async update(id: string, data: UpdateSupplierData): Promise<SupplierEntity | null> {
    const doc = await this.dataSource.update(id, data);
    return doc ? toSupplierEntity(doc) : null;
  }
}
