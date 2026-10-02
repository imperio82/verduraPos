import type { CreateSupplierEntity, SupplierEntity } from "../entities/supplier.entity";
import type { SupplierRepository } from "../repositories/supplier.repository";

export class GetSuppliersUseCase {
	constructor(private readonly supplierRepository: SupplierRepository) {}

	execute(): Promise<SupplierEntity[]> {
		return this.supplierRepository.getSuppliers();
	}
}

export class CreateSupplierUseCase {
	constructor(private readonly supplierRepository: SupplierRepository) {}

	execute(supplier: CreateSupplierEntity): Promise<SupplierEntity> {
		return this.supplierRepository.createSupplier({ ...supplier, nombre: supplier.nombre.trim() });
	}
}
