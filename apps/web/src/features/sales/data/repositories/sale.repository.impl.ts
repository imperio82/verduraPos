import type { CreateSaleEntity, SaleEntity } from "../../domain/entities/sale.entity";
import type { SaleRepository } from "../../domain/repositories/sale.repository";
import type { SaleDatasource } from "../datasource/sale.datasource";

export class SaleRepositoryImpl implements SaleRepository {
	constructor(private readonly saleDatasource: SaleDatasource) {}

	createSale(sale: CreateSaleEntity): Promise<SaleEntity> {
		return this.saleDatasource.createSale(sale);
	}

	getNextSaleNumber(): Promise<number> {
		return this.saleDatasource.getNextSaleNumber();
	}

	getSales(day: string): Promise<SaleEntity[]> {
		return this.saleDatasource.getSales(day);
	}

	getSessionSales(cashSessionId: string): Promise<SaleEntity[]> {
		return this.saleDatasource.getSessionSales(cashSessionId);
	}
}
