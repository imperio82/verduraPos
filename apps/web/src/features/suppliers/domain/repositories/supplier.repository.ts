import type { CreateSupplierEntity, SupplierEntity } from "../entities/supplier.entity";

export interface SupplierRepository {
	getSuppliers(): Promise<SupplierEntity[]>;
	createSupplier(supplier: CreateSupplierEntity): Promise<SupplierEntity>;
}
