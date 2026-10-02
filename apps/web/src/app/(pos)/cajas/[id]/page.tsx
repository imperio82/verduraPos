import type { Metadata } from "next";
import { CashSessionDetailPage } from "@/features/cash-registers/presentation/pages/cash-session-detail-page";

export const metadata: Metadata = { title: "Detalle de caja" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <CashSessionDetailPage sessionId={id} />;
}
