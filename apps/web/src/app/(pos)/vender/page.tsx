import type { Metadata } from "next";
import { SellPage } from "@/features/sales/presentation/pages/sell-page";

export const metadata: Metadata = { title: "Vender" };

export default function Page() {
	return <SellPage />;
}
