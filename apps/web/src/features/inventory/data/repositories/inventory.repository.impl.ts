import type {
	DamageEntity,
	DamageSummaryEntity,
	RecountEntity,
	RegisterDamageEntity,
	RegisterRecountEntity,
} from "../../domain/entities/inventory.entity";
import type { InventoryRepository } from "../../domain/repositories/inventory.repository";
import type { InventoryDatasource } from "../datasource/inventory.datasource";

export class InventoryRepositoryImpl implements InventoryRepository {
	constructor(private readonly datasource: InventoryDatasource) {}

	getLastRecount(): Promise<RecountEntity | null> {
		return this.datasource.getLastRecount();
	}

	registerRecount(recount: RegisterRecountEntity): Promise<RecountEntity> {
		return this.datasource.registerRecount(recount);
	}

	getDamageSummary(): Promise<DamageSummaryEntity> {
		return this.datasource.getDamageSummary();
	}

	registerDamage(damage: RegisterDamageEntity): Promise<DamageEntity> {
		return this.datasource.registerDamage(damage);
	}
}
