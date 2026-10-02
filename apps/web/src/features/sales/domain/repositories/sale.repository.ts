import type { CreateSaleEntity, SaleEntity } from "../entities/sale.entity";

export interface SaleRepository {
	createSale(sale: CreateSaleEntity): Promise<SaleEntity>;
	getNextSaleNumber(): Promise<number>;
}
