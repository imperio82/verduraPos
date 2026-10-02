export const PRODUCT_CATEGORIES = ["frutas", "verduras", "raices", "hierbas"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_UNITS = ["kg", "und", "manojo"] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export interface ProductEntity {
	id: string;
	nombre: string;
	codigo?: string;
	categoria: ProductCategory;
	unidad: ProductUnit;
	precioCompra: number;
	porcentajeGanancia: number;
	precioVenta: number;
	stock: number;
	stockMinimo: number;
	color: string;
	activo: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateProductEntity {
	nombre: string;
	codigo?: string;
	categoria: ProductCategory;
	unidad: ProductUnit;
	precioCompra: number;
	porcentajeGanancia: number;
	precioVenta?: number;
	stock: number;
	stockMinimo: number;
	color: string;
}

export type UpdateProductEntity = Partial<CreateProductEntity> & { activo?: boolean };

export interface ProductFilters {
	categoria?: ProductCategory;
	search?: string;
}

/** Etiqueta, color del punto y tinte de tarjeta por categoría (según diseño). */
export const CATEGORY_META: Record<ProductCategory, { label: string; dot: string; tint: string }> = {
	frutas: { label: "Frutas", dot: "#F08A24", tint: "bg-tint-orange" },
	verduras: { label: "Verduras", dot: "#3E9B3E", tint: "bg-tint-green" },
	raices: { label: "Plátano y raíces", dot: "#A86B32", tint: "bg-tint-sand" },
	hierbas: { label: "Hierbas", dot: "#1F8A70", tint: "bg-tint-teal" },
};

export const UNIT_LABELS: Record<ProductUnit, string> = { kg: "Kilo", und: "Unidad", manojo: "Manojo" };

export const isLowStock = (product: Pick<ProductEntity, "stock" | "stockMinimo">): boolean =>
	product.stock <= product.stockMinimo;

/** Se vendió más de lo registrado: el stock del sistema no cuadra y hay que recontar. */
export const needsRecount = (product: Pick<ProductEntity, "stock">): boolean => product.stock < 0;

/** Mismo cálculo que el backend: costo + %, redondeado a la centena. */
export const salePriceFromCost = (cost: number, profitPercent: number): number =>
	Math.round((cost * (1 + profitPercent / 100)) / 100) * 100;

/** Filtro local (búsqueda instantánea mientras se escribe en el POS). */
export const filterProducts = (products: ProductEntity[], { categoria, search }: ProductFilters): ProductEntity[] => {
	const term = search?.trim().toLowerCase();
	return products.filter(
		(p) =>
			(!categoria || p.categoria === categoria) &&
			(!term || p.nombre.toLowerCase().includes(term) || p.codigo?.toLowerCase().includes(term)),
	);
};
