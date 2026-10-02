import { ConflictError, NotFoundError } from '@/core';
import type { CreateSupplierData, SupplierEntity, UpdateSupplierData } from '../entities/supplier.entity';
import type { SupplierRepository } from '../repositories/supplier.repository';

export class GetSuppliersUseCase {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  execute(): Promise<SupplierEntity[]> {
    return this.supplierRepository.findAll();
  }
}

export class GetSupplierByIdUseCase {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(id: string): Promise<SupplierEntity> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundError('Proveedor no encontrado');
    return supplier;
  }
}

export class CreateSupplierUseCase {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(data: CreateSupplierData): Promise<SupplierEntity> {
    const nombre = data.nombre.trim();
    if (await this.supplierRepository.existsByName(nombre)) {
      throw new ConflictError(`Ya existe un proveedor llamado "${nombre}"`, 'nombre');
    }
    return this.supplierRepository.create({ ...data, nombre });
  }
}

export class UpdateSupplierUseCase {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(id: string, data: UpdateSupplierData): Promise<SupplierEntity> {
    if (data.nombre && (await this.supplierRepository.existsByName(data.nombre.trim(), id))) {
      throw new ConflictError(`Ya existe un proveedor llamado "${data.nombre}"`, 'nombre');
    }
    const updated = await this.supplierRepository.update(id, data);
    if (!updated) throw new NotFoundError('Proveedor no encontrado');
    return updated;
  }
}
