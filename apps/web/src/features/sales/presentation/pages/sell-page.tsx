"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/core/components/page-header";
import { SearchInput } from "@/core/components/search-input";
import { cn } from "@/core/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/core/ui/sheet";
import { SegmentedControl } from "@/core/ui/toggle-group";
import { formatMoney } from "@/core/utils/format";
import { ActiveSessionPicker } from "@/features/cash-registers/presentation/components/active-session-picker";
import { useActiveSession } from "@/features/cash-registers/presentation/hooks/use-active-session";
import {
	filterProducts,
	type ProductCategory,
	type ProductEntity,
} from "@/features/products/domain/entities/product.entity";
import { CategoryChips } from "@/features/products/presentation/components/category-chips";
import { useProducts } from "@/features/products/presentation/hooks/use-products";
import { cartSubtotal, type SaleType } from "../../domain/entities/sale.entity";
import { CartPanel } from "../components/cart-panel";
import { ProductGrid } from "../components/product-grid";
import { WeightDialog } from "../components/weight-dialog";
import { useCheckout, useNextSaleNumber } from "../hooks/use-checkout";
import { useCartStore } from "../store/cart.store";

const MODE_OPTIONS = [
	{ value: "productos", label: "Por producto" },
	{ value: "total", label: "Venta total" },
] as const satisfies readonly { value: SaleType; label: string }[];

/**
 * Vender. Se puede registrar cada producto (con balanza) o solo el total cobrado.
 * Escritorio: catálogo + panel de venta. Móvil: catálogo + barra "Ver venta";
 * en "venta total" el móvil muestra solo la calculadora, porque no se eligen productos.
 */
export function SellPage() {
	const [search, setSearch] = useState("");
	const [categoria, setCategoria] = useState<ProductCategory>();
	const [weighing, setWeighing] = useState<ProductEntity | null>(null);
	const [cartOpen, setCartOpen] = useState(false);

	const { data: products = [], isLoading } = useProducts();
	const { data: nextNumber } = useNextSaleNumber();
	const { session, openSessions, selectSession } = useActiveSession();
	const { mode, setMode, lines, upsert, metodoPago, totalAmount } = useCartStore();
	const checkout = useCheckout();

	const visible = useMemo(() => filterProducts(products, { categoria, search }), [products, categoria, search]);
	const isTotalMode = mode === "total";
	const total = isTotalMode ? totalAmount : cartSubtotal(lines);
	/** En móvil, "venta total" oculta el catálogo; en escritorio sigue visible. */
	const catalogClass = cn(isTotalMode && "hidden lg:flex");
	const currentLine = weighing ? lines.find((l) => l.product.id === weighing.id) : undefined;

	const charge = () =>
		checkout.mutate(
			{
				cashSessionId: session?.id,
				metodoPago,
				...(mode === "productos" ? { lines } : { total: totalAmount }),
			},
			{ onSuccess: () => setCartOpen(false) },
		);

	const cartPanel = (
		<CartPanel
			header={
				<div className="flex items-baseline justify-between gap-2">
					<h2 className="font-display text-2xl font-extrabold">
						Venta #{String(nextNumber ?? 1).padStart(4, "0")}
					</h2>
					<ActiveSessionPicker session={session} openSessions={openSessions} onSelect={selectSession} />
				</div>
			}
			onEditLine={(line) => setWeighing(products.find((p) => p.id === line.product.id) ?? null)}
			onCheckout={charge}
			isCharging={checkout.isPending}
			disabled={!session}
		/>
	);

	return (
		<div className="flex min-h-full">
			<section className="flex min-w-0 flex-1 flex-col gap-4 p-4 pb-28 md:gap-5 md:px-8 md:py-7 lg:pb-7">
				<PageHeader title="Vender" className="justify-between md:justify-start">
					<SegmentedControl
						aria-label="Modo de venta"
						value={mode}
						onValueChange={setMode}
						options={MODE_OPTIONS}
						className="md:order-last"
					/>
					<SearchInput
						label="Buscar producto"
						placeholder="Buscar producto o código…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className={cn("w-full md:w-auto md:flex-1", catalogClass)}
					/>
				</PageHeader>

				<CategoryChips value={categoria} onChange={setCategoria} className={catalogClass} />

				<div className={cn(isTotalMode && "hidden lg:block")}>
					<ProductGrid
						products={visible}
						lines={lines}
						isLoading={isLoading}
						onSelect={(product) => {
							if (isTotalMode) setMode("productos");
							setWeighing(product);
						}}
					/>
				</div>

				{/* Móvil / tablet en "venta total": la calculadora va directo en la pantalla. */}
				{isTotalMode && <div className="flex min-h-[560px] flex-1 flex-col lg:hidden">{cartPanel}</div>}
			</section>

			{/* Escritorio: panel fijo */}
			<aside
				aria-label="Venta actual"
				className="sticky top-0 hidden h-dvh w-[400px] shrink-0 border-l border-[#E7E0D0] bg-card p-7 lg:block xl:w-[420px]"
			>
				{cartPanel}
			</aside>

			{/* Móvil / tablet por producto: barra inferior + hoja */}
			{!isTotalMode && (
				<button
					type="button"
					onClick={() => setCartOpen(true)}
					className="fixed inset-x-3 bottom-[84px] z-30 flex h-16 items-center gap-3 rounded-2xl bg-brand-dark px-5 text-white shadow-lg lg:hidden"
				>
					<span className="flex size-8 items-center justify-center rounded-full bg-brand-yellow text-sm font-extrabold text-brand-dark">
						{lines.length}
					</span>
					<span className="flex-1 text-left text-lg font-bold">Ver venta</span>
					<span className="tabular text-xl font-extrabold">{formatMoney(total)}</span>
				</button>
			)}
			<Sheet open={cartOpen} onOpenChange={setCartOpen}>
				<SheetContent side="bottom" className="h-[92dvh] p-5 pt-6 lg:hidden">
					<SheetTitle className="sr-only">Venta actual</SheetTitle>
					{cartPanel}
				</SheetContent>
			</Sheet>

			<WeightDialog key={weighing?.id ?? "none"} product={weighing} current={currentLine} onClose={() => setWeighing(null)} onConfirm={upsert} />
		</div>
	);
}
