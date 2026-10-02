import {
	type ProductEntity,
	type ProductUnit,
	salePriceFromCost,
} from "@/features/products/domain/entities/product.entity";

/**
 * Ciclo de una compra: se registra "por llegar" (no toca el stock) y cuando la
 * mercancía llega se revisa producto por producto; ahí queda "recibida".
 */
export const PURCHASE_STATUSES = ["por_llegar", "recibida", "cancelada"] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export const PURCHASE_ITEM_STATUSES = ["bien", "falto", "malo"] as const;
export type PurchaseItemStatus = (typeof PURCHASE_ITEM_STATUSES)[number];

export interface PurchaseItem {
	productId: string;
	nombre: string;
	unidad: ProductUnit;
	/** Cantidad comprada (la que se espera recibir). */
	cantidad: number;
	precioCompra: number;
	porcentajeGanancia: number;
	precioVenta: number;
	subtotal: number;
	// ---- Se llenan al revisar la llegada ----
	cantidadRecibida?: number;
	cantidadMala?: number;
	estado?: PurchaseItemStatus;
}

export interface PurchaseEntity {
	id: string;
	codigo: string;
	supplierId: string;
	proveedorNombre: string;
	numeroFactura?: string;
	fechaFactura?: string;
	fechaEntrega: string;
	porcentajeGananciaGeneral: number;
	items: PurchaseItem[];
	total: number;
	/** Valor de lo que entró en buen estado. */
	totalRecibido?: number;
	estado: PurchaseStatus;
	nota?: string;
	notaLlegada?: string;
	recibidaEn?: string;
	createdAt: string;
}

export interface PurchaseFilters {
	from?: string;
	to?: string;
	supplierId?: string;
	estado?: PurchaseStatus;
}

export interface CreatePurchaseEntity {
	supplierId: string;
	numeroFactura?: string;
	fechaFactura?: string;
	fechaEntrega: string;
	porcentajeGananciaGeneral: number;
	items: { productId: string; cantidad: number; precioCompra: number; porcentajeGanancia?: number }[];
	nota?: string;
}

export interface ReceivePurchaseEntity {
	numeroFactura?: string;
	fechaFactura?: string;
	nota?: string;
	items: {
		productId: string;
		estado: PurchaseItemStatus;
		cantidadRecibida: number;
		cantidadMala?: number;
	}[];
}

export const PURCHASE_STATUS_META: Record<PurchaseStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
	por_llegar: { label: "Por llegar", variant: "default" },
	recibida: { label: "Recibida", variant: "secondary" },
	cancelada: { label: "Cancelada", variant: "outline" },
};

export const PURCHASE_ITEM_STATUS_LABELS: Record<PurchaseItemStatus, string> = {
	bien: "Bien",
	falto: "Faltó",
	malo: "Llegó malo",
};

/** Lo que entra al stock de una línea: lo recibido menos lo que llegó malo. */
export const goodQuantity = (item: Pick<PurchaseItem, "cantidadRecibida" | "cantidadMala">): number =>
	Math.max(0, (item.cantidadRecibida ?? 0) - (item.cantidadMala ?? 0));

/** Valor de una compra: si ya se recibió, lo que entró; si no, lo comprado. Las canceladas no suman. */
export const purchaseAmount = (purchase: Pick<PurchaseEntity, "estado" | "total" | "totalRecibido">): number =>
	purchase.estado === "cancelada" ? 0 : purchase.estado === "recibida" ? (purchase.totalRecibido ?? purchase.total) : purchase.total;

/** Cuántas líneas llegaron distinto a lo comprado (faltó o llegó malo). */
export const purchaseIssues = (purchase: Pick<PurchaseEntity, "items">): number =>
	purchase.items.filter((item) => item.estado && item.estado !== "bien").length;

// ---------- Borrador de compra (reglas puras) ----------

export interface PurchaseDraftLine {
	productId: string;
	nombre: string;
	unidad: ProductUnit;
	color: string;
	cantidad: number;
	precioCompra: number;
	porcentajeGanancia: number;
	/** Precio de la última compra, para comparar. */
	ultimoPrecio?: number;
}

export const draftSalePrice = (line: Pick<PurchaseDraftLine, "precioCompra" | "porcentajeGanancia">): number =>
	salePriceFromCost(line.precioCompra, line.porcentajeGanancia);

export const draftTotal = (lines: PurchaseDraftLine[]): number =>
	lines.reduce((sum, line) => sum + Math.round(line.cantidad * line.precioCompra), 0);

export const toDraftLine = (product: ProductEntity, extra: Partial<PurchaseDraftLine> = {}): PurchaseDraftLine => ({
	productId: product.id,
	nombre: product.nombre,
	unidad: product.unidad,
	color: product.color,
	cantidad: 0,
	precioCompra: product.precioCompra,
	porcentajeGanancia: product.porcentajeGanancia,
	ultimoPrecio: product.precioCompra,
	...extra,
});

/**
 * Precarga una compra con lo que se le compró la última vez al proveedor
 * (cantidades y precios), para ahorrar pasos.
 */
export const draftFromLastPurchase = (last: PurchaseEntity | null, products: ProductEntity[]): PurchaseDraftLine[] => {
	if (!last) return [];
	const byId = new Map(products.map((p) => [p.id, p]));
	return last.items.flatMap((item) => {
		const product = byId.get(item.productId);
		return product
			? [
					toDraftLine(product, {
						cantidad: item.cantidad,
						precioCompra: item.precioCompra,
						porcentajeGanancia: product.porcentajeGanancia,
						ultimoPrecio: item.precioCompra,
					}),
				]
			: [];
	});
};

/** "Llega hoy", "Mañana", "Jueves"... */
export const deliveryLabel = (isoDate: string, today = new Date()): string => {
	const date = new Date(isoDate);
	const days = Math.round(
		(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
			new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
			86_400_000,
	);
	if (days < 0) return "Atrasada";
	if (days === 0) return "Llega hoy";
	if (days === 1) return "Mañana";
	const weekday = date.toLocaleDateString("es-CO", { weekday: "long" });
	return weekday.charAt(0).toUpperCase() + weekday.slice(1);
};
