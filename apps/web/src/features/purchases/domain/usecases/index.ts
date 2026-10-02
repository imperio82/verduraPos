import { AppError } from "@/core/errors/app-error";
import type {
	PurchaseDraftLine,
	PurchaseEntity,
	PurchaseFilters,
	ReceivePurchaseEntity,
} from "../entities/purchase.entity";
import type { PurchaseRepository } from "../repositories/purchase.repository";

export class GetPurchasesUseCase {
	constructor(private readonly repository: PurchaseRepository) {}

	execute(filters: PurchaseFilters): Promise<PurchaseEntity[]> {
		return this.repository.getPurchases(filters);
	}
}

export class GetPurchaseUseCase {
	constructor(private readonly repository: PurchaseRepository) {}

	execute(id: string): Promise<PurchaseEntity> {
		return this.repository.getPurchase(id);
	}
}

export class GetLastPurchaseUseCase {
	constructor(private readonly repository: PurchaseRepository) {}

	execute(supplierId: string): Promise<PurchaseEntity | null> {
		return this.repository.getLastPurchase(supplierId);
	}
}

export interface SavePurchaseInput {
	supplierId: string;
	numeroFactura?: string;
	fechaFactura?: string;
	fechaEntrega: string;
	porcentajeGananciaGeneral: number;
	nota?: string;
	lines: PurchaseDraftLine[];
}

/** Nueva compra "por llegar": solo se envían las líneas con cantidad. No toca el stock. */
export class CreatePurchaseUseCase {
	constructor(private readonly repository: PurchaseRepository) {}

	execute({ lines, ...input }: SavePurchaseInput): Promise<PurchaseEntity> {
		if (!input.supplierId) throw new AppError("Elige el proveedor", "VALIDATION_ERROR");
		const items = lines
			.filter((line) => line.cantidad > 0)
			.map(({ productId, cantidad, precioCompra, porcentajeGanancia }) => ({
				productId,
				cantidad,
				precioCompra,
				porcentajeGanancia,
			}));
		if (items.length === 0) throw new AppError("Escribe la cantidad de al menos un producto", "VALIDATION_ERROR");
		return this.repository.createPurchase({
			...input,
			numeroFactura: input.numeroFactura?.trim() || undefined,
			nota: input.nota?.trim() || undefined,
			items,
		});
	}
}

/** Revisar la llegada: bien / faltó / llegó malo. Solo lo bueno suma al stock. */
export class ReceivePurchaseUseCase {
	constructor(private readonly repository: PurchaseRepository) {}

	execute(id: string, data: ReceivePurchaseEntity): Promise<PurchaseEntity> {
		return this.repository.receivePurchase(id, data);
	}
}

export class CancelPurchaseUseCase {
	constructor(private readonly repository: PurchaseRepository) {}

	execute(id: string): Promise<PurchaseEntity> {
		return this.repository.cancelPurchase(id);
	}
}
