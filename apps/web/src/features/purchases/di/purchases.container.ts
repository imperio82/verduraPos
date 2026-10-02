import { container } from "@/core/di/di-container";
import { PurchaseDatasource } from "../data/datasource/purchase.datasource";
import { PurchaseRepositoryImpl } from "../data/repositories/purchase.repository.impl";
import {
	CancelPurchaseUseCase,
	CreatePurchaseUseCase,
	GetLastPurchaseUseCase,
	GetPurchasesUseCase,
	GetPurchaseUseCase,
	ReceivePurchaseUseCase,
} from "../domain/usecases";
import { TOKENS_PURCHASES as T } from "./tokens";

export function purchasesConfigureContainer(): void {
	container.registerClass(T.PurchaseDatasource, PurchaseDatasource);
	container.registerClass(T.PurchaseRepository, PurchaseRepositoryImpl, [T.PurchaseDatasource]);

	const repo = [T.PurchaseRepository];
	container.registerClass(T.GetPurchasesUseCase, GetPurchasesUseCase, repo);
	container.registerClass(T.GetPurchaseUseCase, GetPurchaseUseCase, repo);
	container.registerClass(T.GetLastPurchaseUseCase, GetLastPurchaseUseCase, repo);
	container.registerClass(T.CreatePurchaseUseCase, CreatePurchaseUseCase, repo);
	container.registerClass(T.ReceivePurchaseUseCase, ReceivePurchaseUseCase, repo);
	container.registerClass(T.CancelPurchaseUseCase, CancelPurchaseUseCase, repo);
}
