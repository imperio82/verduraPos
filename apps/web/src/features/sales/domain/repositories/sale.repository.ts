import type { CreateSaleEntity, SaleEntity } from "../entities/sale.entity";

export interface SaleRepository {
	createSale(sale: CreateSaleEntity): Promise<SaleEntity>;
	getNextSaleNumber(): Promise<number>;
	getSales(day: string): Promise<SaleEntity[]>;
	getSessionSales(cashSessionId: string): Promise<SaleEntity[]>;
}
