import type { Metadata } from "next";
import { DailySalesPage } from "@/features/sales/presentation/pages/daily-sales-page";

export const metadata: Metadata = { title: "Ventas del día" };

export default function Page() {
	return <DailySalesPage />;
}
