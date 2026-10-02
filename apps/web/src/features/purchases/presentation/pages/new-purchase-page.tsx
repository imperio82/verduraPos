"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/core/ui/button";
import { PurchaseForm } from "../components/purchase-form";

export function NewPurchasePage() {
	const router = useRouter();

	return (
		<div className="flex flex-col gap-4 p-4 pb-28 md:px-8 md:py-7 lg:pb-7">
			<div className="flex items-center gap-3">
				<Button asChild variant="outline" size="icon" aria-label="Volver a compras">
					<Link href="/inventario">
						<ArrowLeftIcon />
					</Link>
				</Button>
				<div className="flex flex-col">
					<h1 className="font-display text-2xl font-extrabold">Nueva compra</h1>
					<span className="text-sm text-muted-foreground">Queda por llegar; el stock se suma al revisar la llegada.</span>
				</div>
			</div>
			<PurchaseForm onSaved={() => router.push("/inventario")} />
		</div>
	);
}
