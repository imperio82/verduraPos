import { AppError } from "@/core/errors/app-error";
import type {
	DamageEntity,
	DamageSummaryEntity,
	RecountEntity,
	RegisterDamageEntity,
	RegisterRecountEntity,
} from "../entities/inventory.entity";
import type { InventoryRepository } from "../repositories/inventory.repository";

export class GetLastRecountUseCase {
	constructor(private readonly repository: InventoryRepository) {}

	execute(): Promise<RecountEntity | null> {
		return this.repository.getLastRecount();
	}
}

/** Solo se envían los productos que efectivamente se contaron. */
export class RegisterRecountUseCase {
	constructor(private readonly repository: InventoryRepository) {}

	execute(recount: RegisterRecountEntity): Promise<RecountEntity> {
		const items = recount.items.filter((item) => Number.isFinite(item.contado) && item.contado >= 0);
		if (items.length === 0) throw new AppError("Cuenta al menos un producto", "VALIDATION_ERROR");
		return this.repository.registerRecount({ ...recount, items });
	}
}

export class GetDamageSummaryUseCase {
	constructor(private readonly repository: InventoryRepository) {}

	execute(): Promise<DamageSummaryEntity> {
		return this.repository.getDamageSummary();
	}
}

export class RegisterDamageUseCase {
	constructor(private readonly repository: InventoryRepository) {}

	execute(damage: RegisterDamageEntity): Promise<DamageEntity> {
		if (!damage.productId) throw new AppError("Elige el producto", "VALIDATION_ERROR");
		if (damage.cantidad <= 0) throw new AppError("La cantidad debe ser mayor a cero", "VALIDATION_ERROR");
		return this.repository.registerDamage(damage);
	}
}
