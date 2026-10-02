import { container } from "@/core/di/di-container";
import { SupplierDatasource } from "../data/datasource/supplier.datasource";
import { SupplierRepositoryImpl } from "../data/repositories/supplier.repository.impl";
import { CreateSupplierUseCase, GetSuppliersUseCase } from "../domain/usecases";
import { TOKENS_SUPPLIERS as T } from "./tokens";

export function suppliersConfigureContainer(): void {
	container.registerClass(T.SupplierDatasource, SupplierDatasource);
	container.registerClass(T.SupplierRepository, SupplierRepositoryImpl, [T.SupplierDatasource]);
	container.registerClass(T.GetSuppliersUseCase, GetSuppliersUseCase, [T.SupplierRepository]);
	container.registerClass(T.CreateSupplierUseCase, CreateSupplierUseCase, [T.SupplierRepository]);
}
