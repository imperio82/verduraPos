import type {
	CreatePurchaseEntity,
	PurchaseEntity,
	PurchaseFilters,
	ReceivePurchaseEntity,
} from "../entities/purchase.entity";

export interface PurchaseRepository {
	getPurchases(filters: PurchaseFilters): Promise<PurchaseEntity[]>;
	getPurchase(id: string): Promise<PurchaseEntity>;
	getLastPurchase(supplierId: string): Promise<PurchaseEntity | null>;
	createPurchase(purchase: CreatePurchaseEntity): Promise<PurchaseEntity>;
	receivePurchase(id: string, data: ReceivePurchaseEntity): Promise<PurchaseEntity>;
	cancelPurchase(id: string): Promise<PurchaseEntity>;
}
