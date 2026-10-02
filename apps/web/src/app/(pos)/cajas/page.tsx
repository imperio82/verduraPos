import type { Metadata } from "next";
import { CashRegistersPage } from "@/features/cash-registers/presentation/pages/cash-registers-page";

export const metadata: Metadata = { title: "Cajas" };

export default function Page() {
	return <CashRegistersPage />;
}
