import type { CreateSupplierEntity, SupplierEntity } from "../../domain/entities/supplier.entity";
import type { SupplierRepository } from "../../domain/repositories/supplier.repository";
import type { SupplierDatasource } from "../datasource/supplier.datasource";

export class SupplierRepositoryImpl implements SupplierRepository {
	constructor(private readonly supplierDatasource: SupplierDatasource) {}

	getSuppliers(): Promise<SupplierEntity[]> {
		return this.supplierDatasource.getSuppliers();
	}

	createSupplier(supplier: CreateSupplierEntity): Promise<SupplierEntity> {
		return this.supplierDatasource.createSupplier(supplier);
	}
}
