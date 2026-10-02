import type { Metadata } from "next";
import { AccountingPage } from "@/features/accounting/presentation/pages/accounting-page";

export const metadata: Metadata = { title: "Contabilidad" };

export default function Page() {
	return <AccountingPage />;
}
