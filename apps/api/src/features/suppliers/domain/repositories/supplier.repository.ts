import type { CreateSupplierData, SupplierEntity, UpdateSupplierData } from '../entities/supplier.entity';

export interface SupplierRepository {
  findAll(): Promise<SupplierEntity[]>;
  findById(id: string): Promise<SupplierEntity | null>;
  existsByName(nombre: string, excludeId?: string): Promise<boolean>;
  create(data: CreateSupplierData): Promise<SupplierEntity>;
  update(id: string, data: UpdateSupplierData): Promise<SupplierEntity | null>;
}
