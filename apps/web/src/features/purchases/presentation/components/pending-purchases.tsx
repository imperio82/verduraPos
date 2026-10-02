"use client";

import Link from "next/link";
import { EmptyState } from "@/core/components/empty-state";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/ui/button";
import { Skeleton } from "@/core/ui/skeleton";
import { formatMoney } from "@/core/utils/format";
import { deliveryLabel } from "../../domain/entities/purchase.entity";
import { usePurchases } from "../hooks/use-purchases";

/** Compras "por llegar", con acceso directo a revisar la llegada. */
export function PendingPurchases() {
	const { data: purchases = [], isLoading } = usePurchases({ estado: "por_llegar" });

	return (
		<section className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<h2 className="font-display text-xl font-extrabold">Por llegar</h2>
				<Button asChild size="sm" variant="dark">
					<Link href="/inventario/compras/nueva">+ Compra</Link>
				</Button>
			</div>
			{isLoading && <Skeleton className="h-24" />}
			{!isLoading && purchases.length === 0 && <EmptyState title="No hay compras por llegar" className="p-4" />}
			{purchases.map((purchase) => {
				const label = deliveryLabel(purchase.fechaEntrega);
				const arrivesToday = label === "Llega hoy" || label === "Atrasada";
				return (
					<div
						key={purchase.id}
						className={cn("flex flex-col gap-1.5 rounded-xl p-3.5", arrivesToday ? "bg-tint-orange" : "bg-muted")}
					>
						<div className="flex items-center justify-between gap-2">
							<span className="font-bold">
								{purchase.codigo} · {purchase.proveedorNombre}
							</span>
							<span className={cn("shrink-0 text-xs font-bold", arrivesToday ? "text-warning" : "text-muted-foreground")}>
								{label}
							</span>
						</div>
						<span className="text-sm text-muted-foreground">
							{purchase.items.length} productos · {formatMoney(purchase.total)}
							{purchase.nota ? ` · ${purchase.nota.toLowerCase()}` : ""}
						</span>
						<Button asChild size="sm" variant={arrivesToday ? "default" : "outline"} className="mt-1 self-start">
							<Link href={`/inventario/compras/${purchase.id}`}>Revisar llegada</Link>
						</Button>
					</div>
				);
			})}
		</section>
	);
}
