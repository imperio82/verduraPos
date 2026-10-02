import APIClient from "@/core/api/api-client";
import type { CreateSaleEntity, SaleEntity } from "../../domain/entities/sale.entity";

export const urlsSales = {
	createSale: "/sales",
	nextNumber: "/sales/next-number",
} as const;

export class SaleDatasource {
	createSale(sale: CreateSaleEntity): Promise<SaleEntity> {
		return APIClient.post<SaleEntity>({ url: urlsSales.createSale, data: sale });
	}

	async getNextSaleNumber(): Promise<number> {
		const { numero } = await APIClient.get<{ numero: number }>({ url: urlsSales.nextNumber });
		return numero;
	}
}
