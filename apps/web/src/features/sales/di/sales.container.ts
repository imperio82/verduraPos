import { container } from "@/core/di/di-container";
import { SaleDatasource } from "../data/datasource/sale.datasource";
import { SaleRepositoryImpl } from "../data/repositories/sale.repository.impl";
import { CheckoutSaleUseCase, GetNextSaleNumberUseCase } from "../domain/usecases";
import { TOKENS_SALES as T } from "./tokens";

export function salesConfigureContainer(): void {
	container.registerClass(T.SaleDatasource, SaleDatasource);
	container.registerClass(T.SaleRepository, SaleRepositoryImpl, [T.SaleDatasource]);
	container.registerClass(T.CheckoutSaleUseCase, CheckoutSaleUseCase, [T.SaleRepository]);
	container.registerClass(T.GetNextSaleNumberUseCase, GetNextSaleNumberUseCase, [T.SaleRepository]);
}
