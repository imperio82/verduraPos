import type { Metadata } from "next";
import { PurchaseDetailPage } from "@/features/purchases/presentation/pages/purchase-detail-page";

export const metadata: Metadata = { title: "Compra" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <PurchaseDetailPage purchaseId={id} />;
}
