"use client";

import { Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { Field } from "@/core/components/field";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { formatMoney, parseDecimal, toIsoDay } from "@/core/utils/format";
import { ProductAvatar } from "@/features/products/presentation/components/product-avatar";
import { draftSalePrice, draftTotal, toDraftLine } from "../../domain/entities/purchase.entity";
import { usePurchaseDraft } from "../hooks/use-purchase-draft";
import { useCreatePurchase } from "../hooks/use-purchases";

/**
 * Nueva compra. Al elegir el proveedor se precarga lo que se le compró la
 * última vez con esos precios; el precio de venta se calcula con el % de
 * ganancia de cada producto. Queda "por llegar": el stock se suma al revisar
 * la llegada.
 */
export function PurchaseForm({ onSaved }: { onSaved?: () => void }) {
	const { suppliers, products, supplierId, setSupplierId, lastPurchase, draftKey, lines, setLines, updateLine: update } =
		usePurchaseDraft();
	const [numeroFactura, setNumeroFactura] = useState("");
	const [fechaFactura, setFechaFactura] = useState(() => toIsoDay(new Date()));
	const [fechaEntrega, setFechaEntrega] = useState(() => toIsoDay(new Date()));
	const [generalPct, setGeneralPct] = useState(50);
	const [nota, setNota] = useState("");
	const save = useCreatePurchase();

	const available = useMemo(() => products.filter((p) => !lines.some((l) => l.productId === p.id)), [products, lines]);

	const applyGeneralPct = (pct: number) => {
		setGeneralPct(pct);
		setLines((current) => current.map((l) => ({ ...l, porcentajeGanancia: pct })));
	};

	const submit = () =>
		save.mutate(
			{
				supplierId: supplierId ?? "",
				numeroFactura,
				fechaFactura,
				fechaEntrega,
				porcentajeGananciaGeneral: generalPct,
				nota,
				lines,
			},
			{ onSuccess: onSaved },
		);

	return (
		<Card>
			<CardHeader className="flex-wrap">
				<CardTitle>Productos</CardTitle>
				{lastPurchase && <CardDescription>Cargada desde la última compra a este proveedor</CardDescription>}
			</CardHeader>

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
				<Field label="Proveedor" className="col-span-2 lg:col-span-1">
					<Select value={supplierId} onValueChange={setSupplierId}>
						<SelectTrigger>
							<SelectValue placeholder="Elige proveedor" />
						</SelectTrigger>
						<SelectContent>
							{suppliers.map((s) => (
								<SelectItem key={s.id} value={s.id}>
									{s.nombre}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				<Field label="N° de factura" htmlFor="factura">
					<Input id="factura" placeholder="FV-0000" value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} />
				</Field>
				<Field label="Fecha factura" htmlFor="fecha">
					<Input id="fecha" type="date" value={fechaFactura} onChange={(e) => setFechaFactura(e.target.value)} />
				</Field>
				<Field label="Llega" htmlFor="entrega">
					<Input id="entrega" type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} />
				</Field>
				<Field label="% ganancia general" htmlFor="pct">
					<Input
						id="pct"
						inputMode="numeric"
						value={generalPct}
						onChange={(e) => applyGeneralPct(Number.parseInt(e.target.value, 10) || 0)}
					/>
				</Field>
			</div>

			<div className="-mx-5 overflow-x-auto px-5">
				<table className="w-full min-w-[720px] text-[15px]">
					<thead>
						<tr className="text-left text-[13px] font-bold text-muted-foreground">
							<th className="py-2 pr-2">Producto</th>
							<th className="px-2">Cantidad</th>
							<th className="px-2">Precio compra</th>
							<th className="px-2">% ganancia</th>
							<th className="px-2 text-right">Precio venta</th>
							<th className="px-2 text-right">Últ. compra</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{lines.map((line) => {
							const changed = line.ultimoPrecio !== undefined && line.precioCompra !== line.ultimoPrecio;
							return (
								<tr key={`${draftKey}-${line.productId}`} className="border-t border-[#EFE8D6]">
									<td className="py-2 pr-2">
										<span className="flex items-center gap-2 font-semibold">
											<ProductAvatar color={line.color} className="size-5 shadow-none" />
											{line.nombre}
										</span>
									</td>
									<td className="px-2">
										<div className="flex items-center gap-1.5">
											<Input
												className="h-10 w-20"
												inputMode="decimal"
												aria-label={`Cantidad ${line.nombre}`}
												defaultValue={line.cantidad || ""}
												onChange={(e) => update(line.productId, { cantidad: parseDecimal(e.target.value) })}
											/>
											<span className="text-sm text-muted-foreground">{line.unidad}</span>
										</div>
									</td>
									<td className="px-2">
										<Input
											className="h-10 w-28"
											inputMode="numeric"
											aria-label={`Precio compra ${line.nombre}`}
											defaultValue={line.precioCompra}
											onChange={(e) => update(line.productId, { precioCompra: Number.parseInt(e.target.value, 10) || 0 })}
										/>
									</td>
									<td className="px-2">
										<Input
											className="h-10 w-20"
											inputMode="numeric"
											aria-label={`% ganancia ${line.nombre}`}
											value={line.porcentajeGanancia}
											onChange={(e) =>
												update(line.productId, { porcentajeGanancia: Number.parseInt(e.target.value, 10) || 0 })
											}
										/>
									</td>
									<td className="tabular px-2 text-right font-extrabold">{formatMoney(draftSalePrice(line))}</td>
									<td className={cn("tabular px-2 text-right", changed ? "font-bold text-warning" : "text-muted-foreground")}>
										{line.ultimoPrecio !== undefined ? formatMoney(line.ultimoPrecio) : "—"}
									</td>
									<td className="pl-2 text-right">
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label={`Quitar ${line.nombre}`}
											onClick={() => setLines((current) => current.filter((l) => l.productId !== line.productId))}
										>
											<Trash2Icon />
										</Button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<Field label="Nota (opcional)" htmlFor="nota-compra">
				<Input id="nota-compra" placeholder="Ej.: pedido habitual" value={nota} onChange={(e) => setNota(e.target.value)} />
			</Field>

			<div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
				<Select
					value=""
					onValueChange={(id) => {
						const product = products.find((p) => p.id === id);
						if (product) setLines((current) => [...current, toDraftLine(product, { porcentajeGanancia: generalPct })]);
					}}
				>
					<SelectTrigger className="w-auto border-dashed">
						<SelectValue placeholder="+ Agregar producto" />
					</SelectTrigger>
					<SelectContent>
						{available.map((p) => (
							<SelectItem key={p.id} value={p.id}>
								{p.nombre}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<span className="ml-auto text-muted-foreground">Total compra</span>
				<span className="tabular font-display text-2xl font-extrabold">{formatMoney(draftTotal(lines))}</span>
				<Button size="lg" disabled={save.isPending} onClick={submit} className="w-full sm:w-auto">
					{save.isPending ? "Guardando…" : "Guardar compra"}
				</Button>
			</div>
		</Card>
	);
}
