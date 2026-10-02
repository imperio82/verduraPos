"use client";

import { EmptyState } from "@/core/components/empty-state";
import { cn } from "@/core/lib/utils";
import { Skeleton } from "@/core/ui/skeleton";
import { formatMoney, formatQuantity } from "@/core/utils/format";
import { CATEGORY_META, isLowStock, needsRecount, type ProductEntity } from "@/features/products/domain/entities/product.entity";
import { ProductAvatar } from "@/features/products/presentation/components/product-avatar";
import type { CartLine } from "../../domain/entities/sale.entity";

export function ProductGrid({
	products,
	lines,
	isLoading,
	onSelect,
}: {
	products: ProductEntity[];
	lines: CartLine[];
	isLoading: boolean;
	onSelect: (product: ProductEntity) => void;
}) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
				{Array.from({ length: 8 }, (_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: placeholders
					<Skeleton key={i} className="h-40 rounded-[20px] md:h-[184px]" />
				))}
			</div>
		);
	}

	if (products.length === 0) return <EmptyState title="No hay productos con ese filtro" />;

	return (
		<div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
			{products.map((product) => {
				const inCart = lines.find((l) => l.product.id === product.id);
				return (
					<button
						key={product.id}
						type="button"
						onClick={() => onSelect(product)}
						className={cn(
							"relative flex h-40 flex-col items-start gap-1.5 rounded-[20px] p-4 text-left transition-transform active:scale-[0.98] md:h-[184px] md:gap-2",
							CATEGORY_META[product.categoria].tint,
							inCart && "ring-[3px] ring-brand-dark",
						)}
					>
						<ProductAvatar color={product.color} className="size-11 md:size-[58px]" />
						<span className="text-[15px] leading-tight font-bold md:text-[17px]">{product.nombre}</span>
						<span className="tabular text-[17px] font-extrabold md:text-[19px]">
							{formatMoney(product.precioVenta)}{" "}
							<span className="text-sm font-semibold text-[#4A5443]">/ {product.unidad}</span>
						</span>
						<span className="hidden text-[13px] text-[#4A5443] md:block">
							Stock: {formatQuantity(product.stock, product.unidad)}
						</span>
						{inCart ? (
							<span className="absolute top-3 right-3 rounded-full bg-brand-dark px-2.5 py-1 text-xs font-bold text-white">
								{formatQuantity(inCart.cantidad, product.unidad)}
							</span>
						) : (
							isLowStock(product) && (
								<span
									className={cn(
										"absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold text-white",
										needsRecount(product) ? "bg-destructive" : "bg-warning",
									)}
								>
									{needsRecount(product) ? "Revisar stock" : "Poco stock"}
								</span>
							)
						)}
					</button>
				);
			})}
		</div>
	);
}
