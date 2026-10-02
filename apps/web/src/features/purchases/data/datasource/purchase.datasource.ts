import APIClient, { resolveUrl } from "@/core/api/api-client";
import type {
	CreatePurchaseEntity,
	PurchaseEntity,
	PurchaseFilters,
	ReceivePurchaseEntity,
} from "../../domain/entities/purchase.entity";

export const urlsPurchases = {
	purchases: "/purchases",
	purchase: "/purchases/:id",
	lastPurchase: "/purchases/last/:supplierId",
	receivePurchase: "/purchases/:id/receive",
	cancelPurchase: "/purchases/:id/cancel",
} as const;

export class PurchaseDatasource {
	getPurchases(params: PurchaseFilters): Promise<PurchaseEntity[]> {
		return APIClient.get({ url: urlsPurchases.purchases, params });
	}

	getPurchase(id: string): Promise<PurchaseEntity> {
		return APIClient.get({ url: resolveUrl(urlsPurchases.purchase, { id }) });
	}

	getLastPurchase(supplierId: string): Promise<PurchaseEntity | null> {
		return APIClient.get({ url: resolveUrl(urlsPurchases.lastPurchase, { supplierId }) });
	}

	createPurchase(data: CreatePurchaseEntity): Promise<PurchaseEntity> {
		return APIClient.post({ url: urlsPurchases.purchases, data });
	}

	receivePurchase(id: string, data: ReceivePurchaseEntity): Promise<PurchaseEntity> {
		return APIClient.post({ url: resolveUrl(urlsPurchases.receivePurchase, { id }), data });
	}

	cancelPurchase(id: string): Promise<PurchaseEntity> {
		return APIClient.post({ url: resolveUrl(urlsPurchases.cancelPurchase, { id }) });
	}
}
