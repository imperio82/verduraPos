"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "@/core/components/field";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Card } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Skeleton } from "@/core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/ui/table";
import { Textarea } from "@/core/ui/textarea";
import { formatMoney, formatNumber, formatQuantity, formatShortDate, parseDecimal, toIsoDay } from "@/core/utils/format";
import { ProductAvatar } from "@/features/products/presentation/components/product-avatar";
import { useProducts } from "@/features/products/presentation/hooks/use-products";
import {
	goodQuantity,
	PURCHASE_ITEM_STATUS_LABELS,
	PURCHASE_ITEM_STATUSES,
	PURCHASE_STATUS_META,
	type PurchaseEntity,
	type PurchaseItemStatus,
	type ReceivePurchaseEntity,
} from "../../domain/entities/purchase.entity";
import { useCancelPurchase, usePurchase, useReceivePurchase } from "../hooks/use-purchases";

const STATUS_STYLE: Record<PurchaseItemStatus, string> = {
	bien: "bg-success text-white border-success",
	falto: "bg-warning text-white border-warning",
	malo: "bg-destructive text-white border-destructive",
};

const STATUS_TEXT: Record<PurchaseItemStatus, string> = {
	bien: "text-success",
	falto: "text-warning",
	malo: "text-destructive",
};

/** Una compra: si está por llegar se revisa la llegada; si no, se ve su detalle. */
export function PurchaseDetailPage({ purchaseId }: { purchaseId: string }) {
	const { data: purchase, isLoading } = usePurchase(purchaseId);

	if (isLoading || !purchase) {
		return (
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:py-7">
				<Skeleton className="h-16" />
				<Skeleton className="h-64" />
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 pb-28 md:py-7 lg:pb-7">
			<div className="flex items-center gap-3">
				<Button asChild variant="outline" size="icon" aria-label="Volver a compras">
					<Link href="/inventario">
						<ArrowLeftIcon />
					</Link>
				</Button>
				<div className="flex min-w-0 flex-col">
					<div className="flex items-center gap-2">
						<h1 className="font-display text-2xl font-extrabold">
							{purchase.estado === "por_llegar" ? `Llegó la compra ${purchase.codigo}` : `Compra ${purchase.codigo}`}
						</h1>
						<Badge variant={PURCHASE_STATUS_META[purchase.estado].variant}>{PURCHASE_STATUS_META[purchase.estado].label}</Badge>
					</div>
					<span className="text-sm text-muted-foreground">
						{purchase.proveedorNombre} · comprada el {formatShortDate(purchase.createdAt)}
						{purchase.numeroFactura && ` · factura ${purchase.numeroFactura}`}
					</span>
				</div>
			</div>

			{purchase.estado === "por_llegar" ? <ReceptionForm purchase={purchase} /> : <PurchaseSummary purchase={purchase} />}
		</div>
	);
}

type Check = { estado?: PurchaseItemStatus; recibido: string; malo: string };

/**
 * Revisar la llegada: por producto se marca si llegó bien, si faltó o si llegó
 * malo. Al completar se suma al stock lo que llegó en buen estado.
 */
function ReceptionForm({ purchase }: { purchase: PurchaseEntity }) {
	const router = useRouter();
	const { data: products = [] } = useProducts();
	const receive = useReceivePurchase(purchase.id);
	const cancel = useCancelPurchase(purchase.id);

	const [numeroFactura, setNumeroFactura] = useState(purchase.numeroFactura ?? "");
	const [fechaFactura, setFechaFactura] = useState(() => toIsoDay(new Date(purchase.fechaFactura ?? Date.now())));
	const [nota, setNota] = useState("");
	const [checks, setChecks] = useState<Record<string, Check>>({});

	// Por defecto se asume que llegó lo comprado; el usuario solo corrige lo distinto.
	const checkOf = (productId: string): Check => {
		const item = purchase.items.find((i) => i.productId === productId);
		return checks[productId] ?? { recibido: formatNumber(item?.cantidad ?? 0), malo: "" };
	};
	const reviewed = Object.values(checks).filter((c) => c.estado).length;
	const setCheck = (productId: string, patch: Partial<Check>) =>
		setChecks((current) => ({ ...current, [productId]: { ...checkOf(productId), ...patch } }));

	const submit = () => {
		const data: ReceivePurchaseEntity = {
			numeroFactura,
			fechaFactura,
			nota,
			items: purchase.items.map((item) => {
				const check = checkOf(item.productId);
				return {
					productId: item.productId,
					estado: check.estado ?? "bien",
					cantidadRecibida: parseDecimal(check.recibido || "0"),
					cantidadMala: check.estado === "malo" ? parseDecimal(check.malo || check.recibido) : undefined,
				};
			}),
		};
		receive.mutate(data, { onSuccess: () => router.push("/inventario") });
	};

	const cancelPurchase = () => {
		if (window.confirm(`¿Cancelar la compra ${purchase.codigo}? No va a llegar y no se suma nada al stock.`)) {
			cancel.mutate(undefined, { onSuccess: () => router.push("/inventario") });
		}
	};

	return (
		<>
			<div className="grid grid-cols-2 gap-3">
				<Field label="N° factura" htmlFor="factura">
					<Input id="factura" placeholder="FV-0000" value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} />
				</Field>
				<Field label="Fecha factura" htmlFor="fecha">
					<Input id="fecha" type="date" value={fechaFactura} onChange={(e) => setFechaFactura(e.target.value)} />
				</Field>
			</div>

			<span className="text-sm font-bold text-muted-foreground">
				Revisado {reviewed} de {purchase.items.length} · lo que no marques se toma como “Bien”
			</span>

			{purchase.items.map((item) => {
				const check = checkOf(item.productId);
				const color = products.find((p) => p.id === item.productId)?.color ?? "#3E9B3E";
				return (
					<div key={item.productId} className="flex flex-col gap-3 rounded-2xl border border-[#E7E0D0] bg-card p-4">
						<div className="flex items-center gap-3">
							<ProductAvatar color={color} />
							<div className="min-w-0 flex-1">
								<div className="font-bold">{item.nombre}</div>
								<div className="text-sm text-muted-foreground">
									Comprado: {formatQuantity(item.cantidad, item.unidad)} · {formatMoney(item.precioCompra)}
								</div>
							</div>
							<label className="flex flex-col items-end gap-1 text-xs font-bold text-muted-foreground">
								Llegó
								<Input
									className="h-10 w-24 text-right font-bold"
									inputMode="decimal"
									value={check.recibido}
									onChange={(e) => setCheck(item.productId, { recibido: e.target.value })}
								/>
							</label>
						</div>
						<div className="grid grid-cols-3 gap-2" role="group" aria-label={`Estado de ${item.nombre}`}>
							{PURCHASE_ITEM_STATUSES.map((status) => (
								<button
									key={status}
									type="button"
									aria-pressed={check.estado === status}
									onClick={() => setCheck(item.productId, { estado: status })}
									className={cn(
										"h-11 rounded-xl border-[1.5px] text-sm font-bold transition-colors",
										check.estado === status ? STATUS_STYLE[status] : "border-border bg-card",
									)}
								>
									{PURCHASE_ITEM_STATUS_LABELS[status]}
								</button>
							))}
						</div>
						{check.estado === "malo" && (
							<Field label={`¿Cuánto llegó malo? (${item.unidad})`}>
								<Input
									inputMode="decimal"
									placeholder={check.recibido}
									value={check.malo}
									onChange={(e) => setCheck(item.productId, { malo: e.target.value })}
								/>
							</Field>
						)}
					</div>
				);
			})}

			<Field label="Nota de la llegada" htmlFor="nota">
				<Textarea
					id="nota"
					rows={2}
					placeholder="Ej.: Faltaron 5 kg de papa. 2 kg de fresa llegaron golpeadas."
					value={nota}
					onChange={(e) => setNota(e.target.value)}
				/>
			</Field>
			<Button size="xl" variant="dark" disabled={receive.isPending} onClick={submit}>
				{receive.isPending ? "Guardando…" : "Completar y sumar al stock"}
			</Button>
			<Button variant="ghost" className="self-center text-destructive" disabled={cancel.isPending} onClick={cancelPurchase}>
				Cancelar compra
			</Button>
		</>
	);
}

/** Detalle de una compra ya recibida o cancelada. */
function PurchaseSummary({ purchase }: { purchase: PurchaseEntity }) {
	const received = purchase.estado === "recibida";

	return (
		<>
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<Info label="Comprado" value={formatMoney(purchase.total)} />
				<Info label="Entró al stock" value={received ? formatMoney(purchase.totalRecibido ?? 0) : "—"} />
				<Info label="Recibida" value={purchase.recibidaEn ? formatShortDate(purchase.recibidaEn) : "—"} />
				<Info label="% ganancia" value={`${purchase.porcentajeGananciaGeneral} %`} />
			</div>

			<Card className="gap-0 overflow-hidden p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Producto</TableHead>
							<TableHead className="text-right">Comprado</TableHead>
							{received && <TableHead className="text-right">Llegó</TableHead>}
							{received && <TableHead>Estado</TableHead>}
							<TableHead className="text-right">Precio compra</TableHead>
							<TableHead className="text-right">Precio venta</TableHead>
							<TableHead className="text-right">Subtotal</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{purchase.items.map((item) => (
							<TableRow key={item.productId}>
								<TableCell className="font-semibold">{item.nombre}</TableCell>
								<TableCell className="tabular text-right">{formatQuantity(item.cantidad, item.unidad)}</TableCell>
								{received && (
									<TableCell className="tabular text-right">
										{formatQuantity(goodQuantity(item), item.unidad)}
										{(item.cantidadMala ?? 0) > 0 && (
											<div className="text-xs text-destructive">+ {formatQuantity(item.cantidadMala ?? 0, item.unidad)} malo</div>
										)}
									</TableCell>
								)}
								{received && (
									<TableCell className={cn("font-bold", item.estado && STATUS_TEXT[item.estado])}>
										{item.estado ? PURCHASE_ITEM_STATUS_LABELS[item.estado] : "—"}
									</TableCell>
								)}
								<TableCell className="tabular text-right">{formatMoney(item.precioCompra)}</TableCell>
								<TableCell className="tabular text-right font-bold">{formatMoney(item.precioVenta)}</TableCell>
								<TableCell className="tabular text-right">{formatMoney(item.subtotal)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			{purchase.nota && <p className="rounded-xl bg-muted p-4 text-sm">Nota de la compra: {purchase.nota}</p>}
			{purchase.notaLlegada && <p className="rounded-xl bg-tint-orange p-4 text-sm">Nota de la llegada: {purchase.notaLlegada}</p>}
		</>
	);
}

function Info({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl bg-card p-3 ring-1 ring-[#E7E0D0]">
			<div className="text-[13px] font-semibold text-muted-foreground">{label}</div>
			<div className="tabular font-display text-lg font-extrabold">{value}</div>
		</div>
	);
}
