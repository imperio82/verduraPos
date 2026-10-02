import APIClient from "@/core/api/api-client";
import type { CreateSupplierEntity, SupplierEntity } from "../../domain/entities/supplier.entity";

export const urlsSuppliers = {
	getSuppliers: "/suppliers",
	createSupplier: "/suppliers",
} as const;

export class SupplierDatasource {
	getSuppliers(): Promise<SupplierEntity[]> {
		return APIClient.get<SupplierEntity[]>({ url: urlsSuppliers.getSuppliers });
	}

	createSupplier(supplier: CreateSupplierEntity): Promise<SupplierEntity> {
		return APIClient.post<SupplierEntity>({ url: urlsSuppliers.createSupplier, data: supplier });
	}
}
