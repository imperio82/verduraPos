import { AppError } from "@/core/errors/app-error";
import type { PaymentMethod } from "@/features/cash-registers/domain/entities/cash-register.entity";
import type { CartLine, SaleEntity } from "../entities/sale.entity";
import type { SaleRepository } from "../repositories/sale.repository";

export interface CheckoutInput {
	cashSessionId: string | undefined;
	metodoPago: PaymentMethod;
	/** Venta por producto */
	lines?: CartLine[];
	/** Venta total: solo el valor cobrado */
	total?: number;
	nota?: string;
}

/**
 * Cobrar: arma la venta según el modo (por producto o total).
 * Los precios los pone el backend a partir del producto; aquí solo se envían cantidades.
 */
export class CheckoutSaleUseCase {
	constructor(private readonly saleRepository: SaleRepository) {}

	execute({ cashSessionId, metodoPago, lines, total, nota }: CheckoutInput): Promise<SaleEntity> {
		if (!cashSessionId) throw new AppError("Abre una caja para poder vender", "CASH_SESSION_CLOSED");

		if (lines) {
			if (lines.length === 0) throw new AppError("Agrega productos a la venta", "VALIDATION_ERROR");
			return this.saleRepository.createSale({
				cashSessionId,
				metodoPago,
				tipo: "productos",
				items: lines.map((line) => ({ productId: line.product.id, cantidad: line.cantidad })),
				nota,
			});
		}

		if (!total || total <= 0) throw new AppError("Escribe el valor de la venta", "VALIDATION_ERROR");
		return this.saleRepository.createSale({ cashSessionId, metodoPago, tipo: "total", total, nota });
	}
}

export class GetNextSaleNumberUseCase {
	constructor(private readonly saleRepository: SaleRepository) {}

	execute(): Promise<number> {
		return this.saleRepository.getNextSaleNumber();
	}
}
