"use client";

import { useState } from "react";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Textarea } from "@/core/ui/textarea";
import { formatDateTime, formatNumber, formatQuantity, parseDecimal } from "@/core/utils/format";
import { NoOpenSessionNotice } from "@/features/cash-registers/presentation/components/no-open-session-notice";
import { useActiveSession } from "@/features/cash-registers/presentation/hooks/use-active-session";
import { useProducts } from "@/features/products/presentation/hooks/use-products";
import { useLastRecount, useRegisterRecount } from "../hooks/use-inventory";

/** Último reconteo (sistema vs. contado) y botón para iniciar uno nuevo. */
export function RecountPanel({ compact = false }: { compact?: boolean }) {
	const { data: last } = useLastRecount();
	const [open, setOpen] = useState(false);
	const items = compact ? last?.items.slice(0, 3) : last?.items;

	return (
		<section className="flex flex-col gap-3">
			<div className="flex items-baseline justify-between">
				<h2 className="font-display text-xl font-extrabold">Reconteo</h2>
				<span className="text-sm text-muted-foreground">
					{last ? `Último: ${formatDateTime(last.createdAt).toLowerCase()}` : "Sin reconteos"}
				</span>
			</div>
			{items && items.length > 0 && (
				<div className="flex flex-col text-sm">
					<div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 pb-1 text-xs font-bold text-muted-foreground">
						<span>Producto</span>
						<span className="w-16 text-right">Sistema</span>
						<span className="w-16 text-right">Contado</span>
						<span className="w-12 text-right">Dif.</span>
					</div>
					{items.map((item) => (
						<div key={item.productId} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-t border-[#EFE8D6] py-1.5">
							<span className="truncate font-semibold">{item.nombre}</span>
							<span className="tabular w-16 text-right">{formatQuantity(item.sistema, item.unidad)}</span>
							<span className="tabular w-16 text-right">{formatQuantity(item.contado, item.unidad)}</span>
							<span
								className={cn(
									"tabular w-12 text-right font-bold",
									item.diferencia < 0 ? "text-destructive" : item.diferencia > 0 && "text-info",
								)}
							>
								{item.diferencia > 0 ? "+" : ""}
								{formatNumber(item.diferencia)}
							</span>
						</div>
					))}
				</div>
			)}
			<Button variant="outline" onClick={() => setOpen(true)}>
				Iniciar reconteo
			</Button>
			<RecountDialog open={open} onOpenChange={setOpen} />
		</section>
	);
}

/**
 * Se cuenta lo que hay físicamente; los productos que se dejen vacíos no se tocan.
 * El stock queda igual a lo contado y la diferencia queda registrada.
 */
function RecountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const { data: products = [] } = useProducts();
	const { session } = useActiveSession();
	const register = useRegisterRecount();
	const [counts, setCounts] = useState<Record<string, string>>({});
	const [nota, setNota] = useState("");

	const submit = () => {
		if (!session) return;
		register.mutate(
			{
				nota,
				cashSessionId: session.id,
				items: Object.entries(counts)
					.filter(([, value]) => value.trim() !== "")
					.map(([productId, value]) => ({ productId, contado: parseDecimal(value) })),
			},
			{
				onSuccess: () => {
					setCounts({});
					setNota("");
					onOpenChange(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Reconteo de producto</DialogTitle>
					<DialogDescription>Escribe cuánto hay de verdad. Deja en blanco lo que no contaste.</DialogDescription>
				</DialogHeader>
				<div className="flex max-h-[50dvh] flex-col overflow-y-auto">
					{products.map((product) => {
						const raw = counts[product.id] ?? "";
						const diff = raw.trim() ? parseDecimal(raw) - product.stock : null;
						return (
							<div key={product.id} className="flex items-center gap-3 border-b border-[#EFE8D6] py-2">
								<span className="flex-1 font-semibold">{product.nombre}</span>
								<span className="tabular w-20 text-right text-sm text-muted-foreground">
									{formatQuantity(product.stock, product.unidad)}
								</span>
								<Input
									className="h-10 w-20 text-right"
									inputMode="decimal"
									aria-label={`Contado ${product.nombre}`}
									value={raw}
									onChange={(e) => setCounts((c) => ({ ...c, [product.id]: e.target.value }))}
								/>
								<span
									className={cn(
										"tabular w-12 text-right text-sm font-bold",
										diff !== null && diff < 0 && "text-destructive",
									)}
								>
									{diff === null ? "" : `${diff > 0 ? "+" : ""}${formatNumber(diff)}`}
								</span>
							</div>
						);
					})}
				</div>
				<Textarea rows={2} placeholder="Nota (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} />
				{!session && <NoOpenSessionNotice what="un reconteo" />}
				<DialogFooter>
					<Button variant="dark" disabled={!session || register.isPending} onClick={submit}>
						Guardar reconteo
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
