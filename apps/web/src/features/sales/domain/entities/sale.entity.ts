import type { PaymentMethod } from "@/features/cash-registers/domain/entities/cash-register.entity";
import type { ProductEntity, ProductUnit } from "@/features/products/domain/entities/product.entity";

export type SaleType = "productos" | "total";

export interface SaleItem {
	productId: string;
	nombre: string;
	unidad: ProductUnit;
	cantidad: number;
	precioUnitario: number;
	total: number;
}

export interface SaleEntity {
	id: string;
	numero: number;
	cashSessionId: string;
	cajaNombre: string;
	cajero: string;
	tipo: SaleType;
	items: SaleItem[];
	subtotal: number;
	descuento: number;
	total: number;
	metodoPago: PaymentMethod;
	nota?: string;
	createdAt: string;
}

export interface CreateSaleEntity {
	cashSessionId: string;
	tipo: SaleType;
	metodoPago: PaymentMethod;
	items?: { productId: string; cantidad: number }[];
	total?: number;
	descuento?: number;
	nota?: string;
}

// ---------- Carrito (regla de negocio pura, sin React) ----------

export interface CartLine {
	product: Pick<ProductEntity, "id" | "nombre" | "unidad" | "precioVenta" | "color">;
	/** En la unidad del producto (kg, und, manojo). */
	cantidad: number;
}

export const lineTotal = (line: CartLine): number => Math.round(line.cantidad * line.product.precioVenta);

export const cartSubtotal = (lines: CartLine[]): number => lines.reduce((sum, line) => sum + lineTotal(line), 0);

/** Si el producto ya está en la venta, se reemplaza la cantidad; si no, se agrega. */
export const upsertLine = (lines: CartLine[], line: CartLine): CartLine[] =>
	lines.some((l) => l.product.id === line.product.id)
		? lines.map((l) => (l.product.id === line.product.id ? line : l))
		: [...lines, line];

export const removeLine = (lines: CartLine[], productId: string): CartLine[] =>
	lines.filter((l) => l.product.id !== productId);

// ---------- Balanza ----------

/** Cómo se ingresa la cantidad en la balanza. */
export type WeightInputUnit = "kg" | "lb" | "und";

/** En Colombia la libra de plaza es 500 g. */
export const POUND_IN_KG = 0.5;

export const toProductQuantity = (value: number, inputUnit: WeightInputUnit): number =>
	inputUnit === "lb" ? value * POUND_IN_KG : value;

/** Atajos de peso de la pantalla de balanza. */
export const WEIGHT_SHORTCUTS: readonly { label: string; unit: WeightInputUnit; value: number }[] = [
	{ label: "1 lb", unit: "lb", value: 1 },
	{ label: "½ kg", unit: "kg", value: 0.5 },
	{ label: "1 kg", unit: "kg", value: 1 },
	{ label: "2 kg", unit: "kg", value: 2 },
];
