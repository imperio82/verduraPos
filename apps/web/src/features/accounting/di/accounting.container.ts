import { container } from "@/core/di/di-container";
import { AccountingDatasource } from "../data/datasource/accounting.datasource";
import { AccountingRepositoryImpl } from "../data/repositories/accounting.repository.impl";
import { GetAccountingSummaryUseCase } from "../domain/usecases";
import { TOKENS_ACCOUNTING as T } from "./tokens";

export function accountingConfigureContainer(): void {
	container.registerClass(T.AccountingDatasource, AccountingDatasource);
	container.registerClass(T.AccountingRepository, AccountingRepositoryImpl, [T.AccountingDatasource]);
	container.registerClass(T.GetAccountingSummaryUseCase, GetAccountingSummaryUseCase, [T.AccountingRepository]);
}
