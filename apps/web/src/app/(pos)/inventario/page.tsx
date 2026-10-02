import type { Metadata } from "next";
import { InventoryPage } from "@/features/inventory/presentation/pages/inventory-page";

export const metadata: Metadata = { title: "Inventario" };

export default function Page() {
	return <InventoryPage />;
}
