import { container } from "@/core/di/di-container";
import { CashRegisterDatasource } from "../data/datasource/cash-register.datasource";
import { CashRegisterRepositoryImpl } from "../data/repositories/cash-register.repository.impl";
import {
	AddCashIncomeUseCase,
	CloseCashSessionUseCase,
	CreateCashRegisterUseCase,
	GetCashRegistersUseCase,
	GetCashSessionDetailUseCase,
	GetCashSessionsUseCase,
	OpenCashSessionUseCase,
} from "../domain/usecases";
import { TOKENS_CASH_REGISTERS as T } from "./tokens";

export function cashRegistersConfigureContainer(): void {
	container.registerClass(T.CashRegisterDatasource, CashRegisterDatasource);
	container.registerClass(T.CashRegisterRepository, CashRegisterRepositoryImpl, [T.CashRegisterDatasource]);

	const repo = [T.CashRegisterRepository];
	container.registerClass(T.GetCashRegistersUseCase, GetCashRegistersUseCase, repo);
	container.registerClass(T.CreateCashRegisterUseCase, CreateCashRegisterUseCase, repo);
	container.registerClass(T.GetCashSessionsUseCase, GetCashSessionsUseCase, repo);
	container.registerClass(T.GetCashSessionDetailUseCase, GetCashSessionDetailUseCase, repo);
	container.registerClass(T.OpenCashSessionUseCase, OpenCashSessionUseCase, repo);
	container.registerClass(T.AddCashIncomeUseCase, AddCashIncomeUseCase, repo);
	container.registerClass(T.CloseCashSessionUseCase, CloseCashSessionUseCase, repo);
}
