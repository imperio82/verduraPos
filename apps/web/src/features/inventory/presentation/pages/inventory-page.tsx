"use client";

import { PageHeader } from "@/core/components/page-header";
import { Card } from "@/core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/tabs";
import { PendingPurchases } from "@/features/purchases/presentation/components/pending-purchases";
import { PurchasesList } from "@/features/purchases/presentation/components/purchases-list";
import { DamagePanel } from "../components/damage-panel";
import { RecountPanel } from "../components/recount-panel";
import { StockTable } from "../components/stock-table";

/**
 * Inventario inteligente: stock, compras (se registran "por llegar" y suman al
 * stock al revisar la llegada), reconteo y producto dañado.
 */
export function InventoryPage() {
	return (
		<div className="flex min-h-full">
			<Tabs defaultValue="compras" className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-28 md:px-8 md:py-7 lg:pb-7">
				<PageHeader title="Inventario">
					<TabsList aria-label="Secciones de inventario" className="overflow-x-auto">
						<TabsTrigger value="stock">Stock</TabsTrigger>
						<TabsTrigger value="compras">Compras</TabsTrigger>
						<TabsTrigger value="por-llegar" className="xl:hidden">
							Por llegar
						</TabsTrigger>
						<TabsTrigger value="reconteo">Reconteo</TabsTrigger>
						<TabsTrigger value="danados">Dañados</TabsTrigger>
					</TabsList>
				</PageHeader>

				<TabsContent value="stock">
					<StockTable />
				</TabsContent>
				<TabsContent value="compras">
					<PurchasesList />
				</TabsContent>
				<TabsContent value="por-llegar">
					<Card>
						<PendingPurchases />
					</Card>
				</TabsContent>
				<TabsContent value="reconteo">
					<Card>
						<RecountPanel />
					</Card>
				</TabsContent>
				<TabsContent value="danados">
					<Card>
						<DamagePanel showList />
					</Card>
				</TabsContent>
			</Tabs>

			<aside className="hidden w-[380px] shrink-0 flex-col gap-6 border-l border-[#E7E0D0] bg-card p-7 xl:flex">
				<PendingPurchases />
				<hr className="border-[#EFE8D6]" />
				<RecountPanel compact />
				<hr className="border-[#EFE8D6]" />
				<DamagePanel />
			</aside>
		</div>
	);
}
