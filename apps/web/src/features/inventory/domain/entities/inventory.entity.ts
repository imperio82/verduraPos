import type { ProductUnit } from "@/features/products/domain/entities/product.entity";

export interface RecountItem {
	productId: string;
	nombre: string;
	unidad: ProductUnit;
	sistema: number;
	contado: number;
	diferencia: number;
}

export interface RecountEntity {
	id: string;
	items: RecountItem[];
	nota?: string;
	createdAt: string;
}

export interface RegisterRecountEntity {
	items: { productId: string; contado: number }[];
	nota?: string;
	/** Caja del turno en que se hace. */
	cashSessionId: string;
}

export interface DamageEntity {
	id: string;
	productId: string;
	nombre: string;
	unidad: ProductUnit;
	cantidad: number;
	costo: number;
	motivo?: string;
	createdAt: string;
}

export interface RegisterDamageEntity {
	productId: string;
	cantidad: number;
	motivo?: string;
	/** Caja del turno en que se registra. */
	cashSessionId: string;
}

export interface DamageSummaryEntity {
	desde: string;
	hasta: string;
	cantidadPorUnidad: Partial<Record<ProductUnit, number>>;
	costoTotal: number;
	items: DamageEntity[];
}

export const DAMAGE_REASONS = ["Golpeado", "Muy maduro", "Podrido", "Llegó malo", "Otro"] as const;
