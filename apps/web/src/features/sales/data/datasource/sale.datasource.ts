import APIClient from "@/core/api/api-client";
import type { CreateSaleEntity, SaleEntity } from "../../domain/entities/sale.entity";

export const urlsSales = {
	createSale: "/sales",
	getSales: "/sales",
	nextNumber: "/sales/next-number",
} as const;

export class SaleDatasource {
	createSale(sale: CreateSaleEntity): Promise<SaleEntity> {
		return APIClient.post<SaleEntity>({ url: urlsSales.createSale, data: sale });
	}

	/** Ventas de un día (YYYY-MM-DD). */
	getSales(day: string): Promise<SaleEntity[]> {
		return APIClient.get<SaleEntity[]>({ url: urlsSales.getSales, params: { from: day, to: day } });
	}

	async getNextSaleNumber(): Promise<number> {
		const { numero } = await APIClient.get<{ numero: number }>({ url: urlsSales.nextNumber });
		return numero;
	}
}
