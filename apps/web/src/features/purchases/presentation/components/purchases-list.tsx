"use client";

import { CalendarRangeIcon, PlusIcon, TruckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DateRangeDialog } from "@/core/components/date-range-dialog";
import { EmptyState } from "@/core/components/empty-state";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Card, CardHeader, CardTitle } from "@/core/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Skeleton } from "@/core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/ui/table";
import { SegmentedControl } from "@/core/ui/toggle-group";
import { formatMoney, formatShortDate } from "@/core/utils/format";
import { PERIOD_OPTIONS, type PeriodPreset, presetToRange } from "@/core/utils/period";
import { useSuppliers } from "@/features/suppliers/presentation/hooks/use-suppliers";
import {
	deliveryLabel,
	PURCHASE_STATUS_META,
	PURCHASE_STATUSES,
	type PurchaseEntity,
	type PurchaseStatus,
	purchaseAmount,
	purchaseIssues,
} from "../../domain/entities/purchase.entity";
import { usePurchases } from "../hooks/use-purchases";

const ALL = "todos";

/** Compras realizadas, filtrables por fecha, proveedor y estado. */
export function PurchasesList() {
	const [preset, setPreset] = useState<PeriodPreset>("mes");
	const [range, setRange] = useState(() => presetToRange("mes"));
	const [rangeOpen, setRangeOpen] = useState(false);
	const [supplierId, setSupplierId] = useState(ALL);
	const [estado, setEstado] = useState<PurchaseStatus | typeof ALL>(ALL);

	const { data: suppliers = [] } = useSuppliers();
	const { data: purchases = [], isLoading } = usePurchases({
		...range,
		supplierId: supplierId === ALL ? undefined : supplierId,
		estado: estado === ALL ? undefined : estado,
	});
	const total = purchases.reduce((sum, p) => sum + purchaseAmount(p), 0);

	const selectPreset = (value: PeriodPreset) => {
		setPreset(value);
		if (value !== "rango") setRange(presetToRange(value));
	};

	return (
		<Card className="gap-4">
			<CardHeader className="flex-wrap">
				<CardTitle>Compras</CardTitle>
				<Button asChild variant="dark" size="sm">
					<Link href="/inventario/compras/nueva">
						<PlusIcon /> Nueva compra
					</Link>
				</Button>
			</CardHeader>

			<div className="flex flex-wrap items-center gap-2">
				<SegmentedControl aria-label="Periodo" value={preset} onValueChange={selectPreset} options={PERIOD_OPTIONS} />
				<Button variant={preset === "rango" ? "dark" : "outline"} onClick={() => setRangeOpen(true)}>
					<CalendarRangeIcon />
					{preset === "rango" ? `${formatShortDate(`${range.from}T12:00`)} – ${formatShortDate(`${range.to}T12:00`)}` : "Elegir fechas"}
				</Button>
				<Select value={supplierId} onValueChange={setSupplierId}>
					<SelectTrigger className="w-auto min-w-44" aria-label="Proveedor">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL}>Todos los proveedores</SelectItem>
						{suppliers.map((s) => (
							<SelectItem key={s.id} value={s.id}>
								{s.nombre}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={estado} onValueChange={(value) => setEstado(value as PurchaseStatus | typeof ALL)}>
					<SelectTrigger className="w-auto min-w-36" aria-label="Estado">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL}>Todos los estados</SelectItem>
						{PURCHASE_STATUSES.map((s) => (
							<SelectItem key={s} value={s}>
								{PURCHASE_STATUS_META[s].label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{isLoading ? (
				<Skeleton className="h-48" />
			) : purchases.length === 0 ? (
				<EmptyState icon={<TruckIcon />} title="No hay compras con estos filtros" />
			) : (
				<>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Compra</TableHead>
								<TableHead>Fecha</TableHead>
								<TableHead>Llegada</TableHead>
								<TableHead className="text-right">Total</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead />
							</TableRow>
						</TableHeader>
						<TableBody>
							{purchases.map((p) => (
								<PurchaseRow key={p.id} purchase={p} />
							))}
						</TableBody>
					</Table>
					<div className="flex justify-between rounded-xl bg-muted px-4 py-3 font-bold">
						<span>
							{purchases.length} {purchases.length === 1 ? "compra" : "compras"}
						</span>
						<span className="tabular">{formatMoney(total)}</span>
					</div>
				</>
			)}

			<DateRangeDialog
				key={`${range.from}-${range.to}`}
				open={rangeOpen}
				onOpenChange={setRangeOpen}
				initial={range}
				onApply={(next) => {
					setPreset("rango");
					setRange(next);
				}}
			/>
		</Card>
	);
}

function PurchaseRow({ purchase: p }: { purchase: PurchaseEntity }) {
	const pending = p.estado === "por_llegar";
	const issues = purchaseIssues(p);
	const arrival = pending ? deliveryLabel(p.fechaEntrega) : p.recibidaEn ? formatShortDate(p.recibidaEn) : "—";

	return (
		<TableRow className={cn(pending && "bg-tint-cream", p.estado === "cancelada" && "text-muted-foreground")}>
			<TableCell className="max-w-60">
				<div className="font-bold">{p.codigo}</div>
				<div className="truncate text-sm text-muted-foreground" title={p.proveedorNombre}>
					{p.proveedorNombre} · {p.items.length} {p.items.length === 1 ? "producto" : "productos"}
				</div>
			</TableCell>
			<TableCell className="whitespace-nowrap">
				{formatShortDate(p.createdAt)}
				{p.numeroFactura && <div className="text-sm text-muted-foreground">{p.numeroFactura}</div>}
			</TableCell>
			<TableCell className={cn("whitespace-nowrap", pending && arrival === "Atrasada" && "font-bold text-destructive")}>
				{arrival}
				{issues > 0 && (
					<div className="text-sm font-semibold text-warning">
						{issues} {issues === 1 ? "novedad" : "novedades"}
					</div>
				)}
			</TableCell>
			<TableCell className={cn("tabular text-right font-bold", p.estado === "cancelada" && "line-through")}>
				{formatMoney(p.estado === "cancelada" ? p.total : purchaseAmount(p))}
			</TableCell>
			<TableCell>
				<Badge variant={PURCHASE_STATUS_META[p.estado].variant}>{PURCHASE_STATUS_META[p.estado].label}</Badge>
			</TableCell>
			<TableCell className="whitespace-nowrap text-right">
				<Button asChild size="sm" variant={pending ? "default" : "outline"}>
					<Link href={`/inventario/compras/${p.id}`}>{pending ? "Revisar llegada" : "Ver detalle"}</Link>
				</Button>
			</TableCell>
		</TableRow>
	);
}
