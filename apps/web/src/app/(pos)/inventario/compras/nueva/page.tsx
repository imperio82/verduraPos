import type { Metadata } from "next";
import { NewPurchasePage } from "@/features/purchases/presentation/pages/new-purchase-page";

export const metadata: Metadata = { title: "Nueva compra" };

export default function Page() {
	return <NewPurchasePage />;
}
