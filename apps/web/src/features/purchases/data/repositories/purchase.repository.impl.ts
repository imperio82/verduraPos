import type {
	CreatePurchaseEntity,
	PurchaseEntity,
	PurchaseFilters,
	ReceivePurchaseEntity,
} from "../../domain/entities/purchase.entity";
import type { PurchaseRepository } from "../../domain/repositories/purchase.repository";
import type { PurchaseDatasource } from "../datasource/purchase.datasource";

export class PurchaseRepositoryImpl implements PurchaseRepository {
	constructor(private readonly datasource: PurchaseDatasource) {}

	getPurchases(filters: PurchaseFilters): Promise<PurchaseEntity[]> {
		return this.datasource.getPurchases(filters);
	}

	getPurchase(id: string): Promise<PurchaseEntity> {
		return this.datasource.getPurchase(id);
	}

	getLastPurchase(supplierId: string): Promise<PurchaseEntity | null> {
		return this.datasource.getLastPurchase(supplierId);
	}

	createPurchase(purchase: CreatePurchaseEntity): Promise<PurchaseEntity> {
		return this.datasource.createPurchase(purchase);
	}

	receivePurchase(id: string, data: ReceivePurchaseEntity): Promise<PurchaseEntity> {
		return this.datasource.receivePurchase(id, data);
	}

	cancelPurchase(id: string): Promise<PurchaseEntity> {
		return this.datasource.cancelPurchase(id);
	}
}
