import APIClient from "@/core/api/api-client";
import type {
	DamageEntity,
	DamageSummaryEntity,
	RecountEntity,
	RegisterDamageEntity,
	RegisterRecountEntity,
} from "../../domain/entities/inventory.entity";

export const urlsInventory = {
	lastRecount: "/inventory/recounts/last",
	recounts: "/inventory/recounts",
	damages: "/inventory/damages",
} as const;

export class InventoryDatasource {
	getLastRecount(): Promise<RecountEntity | null> {
		return APIClient.get({ url: urlsInventory.lastRecount });
	}

	registerRecount(data: RegisterRecountEntity): Promise<RecountEntity> {
		return APIClient.post({ url: urlsInventory.recounts, data });
	}

	getDamageSummary(): Promise<DamageSummaryEntity> {
		return APIClient.get({ url: urlsInventory.damages });
	}

	registerDamage(data: RegisterDamageEntity): Promise<DamageEntity> {
		return APIClient.post({ url: urlsInventory.damages, data });
	}
}
