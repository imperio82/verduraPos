import type {
	DamageEntity,
	DamageSummaryEntity,
	RecountEntity,
	RegisterDamageEntity,
	RegisterRecountEntity,
} from "../entities/inventory.entity";

export interface InventoryRepository {
	getLastRecount(): Promise<RecountEntity | null>;
	registerRecount(recount: RegisterRecountEntity): Promise<RecountEntity>;
	getDamageSummary(): Promise<DamageSummaryEntity>;
	registerDamage(damage: RegisterDamageEntity): Promise<DamageEntity>;
}
