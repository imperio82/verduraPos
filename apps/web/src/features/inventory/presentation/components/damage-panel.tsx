"use client";

import { useState } from "react";
import { Field } from "@/core/components/field";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { formatMoney, formatQuantity, formatShortDate, parseDecimal } from "@/core/utils/format";
import { NoOpenSessionNotice } from "@/features/cash-registers/presentation/components/no-open-session-notice";
import { useActiveSession } from "@/features/cash-registers/presentation/hooks/use-active-session";
import type { ProductUnit } from "@/features/products/domain/entities/product.entity";
import { useProducts } from "@/features/products/presentation/hooks/use-products";
import { DAMAGE_REASONS } from "../../domain/entities/inventory.entity";
import { useDamageSummary, useRegisterDamage } from "../hooks/use-inventory";

/** Producto dañado: resumen de la semana y registro rápido. */
export function DamagePanel({ showList = false }: { showList?: boolean }) {
	const { data: summary } = useDamageSummary();
	const [open, setOpen] = useState(false);

	const quantities = summary
		? (Object.entries(summary.cantidadPorUnidad) as [ProductUnit, number][]).map(([u, q]) => formatQuantity(q, u)).join(" + ")
		: "";

	return (
		<section className="flex flex-col gap-3">
			<h2 className="font-display text-xl font-extrabold">Producto dañado</h2>
			<span className="text-sm text-muted-foreground">
				{summary && summary.items.length > 0
					? `Esta semana: ${quantities} · ${formatMoney(summary.costoTotal)} perdidos`
					: "Sin producto dañado esta semana"}
			</span>
			{showList &&
				summary?.items.map((item) => (
					<div key={item.id} className="flex items-center gap-3 border-b border-[#EFE8D6] py-2 text-sm">
						<span className="w-14 text-muted-foreground">{formatShortDate(item.createdAt)}</span>
						<span className="flex-1 font-semibold">
							{item.nombre} <span className="font-normal text-muted-foreground">· {item.motivo}</span>
						</span>
						<span className="tabular">{formatQuantity(item.cantidad, item.unidad)}</span>
						<span className="tabular w-20 text-right font-bold text-destructive">{formatMoney(item.costo)}</span>
					</div>
				))}
			<Button variant="outline" onClick={() => setOpen(true)}>
				Registrar dañado
			</Button>
			<DamageDialog open={open} onOpenChange={setOpen} />
		</section>
	);
}

function DamageDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const { data: products = [] } = useProducts();
	const { session } = useActiveSession();
	const register = useRegisterDamage();
	const [productId, setProductId] = useState("");
	const [cantidad, setCantidad] = useState("");
	const [motivo, setMotivo] = useState<string>(DAMAGE_REASONS[0]);
	const product = products.find((p) => p.id === productId);
	const qty = parseDecimal(cantidad);

	const submit = () => {
		if (!session) return;
		register.mutate(
			{ productId, cantidad: qty, motivo, cashSessionId: session.id },
			{
				onSuccess: () => {
					setCantidad("");
					onOpenChange(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Registrar producto dañado</DialogTitle>
					<DialogDescription>
						Sale del stock y se cuenta como pérdida al precio de compra
						{session && ` · queda en ${session.cajaNombre}`}.
					</DialogDescription>
				</DialogHeader>
				<Field label="Producto">
					<Select value={productId} onValueChange={setProductId}>
						<SelectTrigger>
							<SelectValue placeholder="Elige el producto" />
						</SelectTrigger>
						<SelectContent>
							{products.map((p) => (
								<SelectItem key={p.id} value={p.id}>
									{p.nombre}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				<div className="grid grid-cols-2 gap-3">
					<Field label={`Cantidad${product ? ` (${product.unidad})` : ""}`} htmlFor="damage-qty">
						<Input id="damage-qty" inputMode="decimal" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
					</Field>
					<Field label="Motivo">
						<Select value={motivo} onValueChange={setMotivo}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{DAMAGE_REASONS.map((r) => (
									<SelectItem key={r} value={r}>
										{r}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				</div>
				{product && qty > 0 && (
					<p className="text-sm text-muted-foreground">
						Pérdida estimada:{" "}
						<strong className="text-destructive">{formatMoney(qty * product.precioCompra)}</strong>
					</p>
				)}
				{!session && <NoOpenSessionNotice what="producto dañado" />}
				<DialogFooter>
					<Button variant="dark" disabled={!session || !productId || qty <= 0 || register.isPending} onClick={submit}>
						Registrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
