"use client";

import { cn } from "@/core/lib/utils";
import { CATEGORY_META, PRODUCT_CATEGORIES, type ProductCategory } from "../../domain/entities/product.entity";

/** Filtro por categoría: Todos · Frutas · Verduras · Plátano y raíces · Hierbas. */
export function CategoryChips({
	value,
	onChange,
	className,
}: {
	value: ProductCategory | undefined;
	onChange: (value: ProductCategory | undefined) => void;
	className?: string;
}) {
	const options: { value: ProductCategory | undefined; label: string; dot: string }[] = [
		{ value: undefined, label: "Todos", dot: "#FFC83D" },
		...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_META[c].label, dot: CATEGORY_META[c].dot })),
	];

	return (
		<div className={cn("-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1", className)} role="group" aria-label="Categorías">
			{options.map((option) => {
				const active = option.value === value;
				return (
					<button
						key={option.label}
						type="button"
						aria-pressed={active}
						onClick={() => onChange(option.value)}
						className={cn(
							"flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[15px] font-bold transition-colors",
							active ? "bg-brand-dark text-white" : "bg-card text-foreground hover:bg-muted",
						)}
					>
						<span className="size-2.5 rounded-full" style={{ backgroundColor: option.dot }} />
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
