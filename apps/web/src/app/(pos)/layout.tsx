import { AppShell } from "@/core/layouts/app-shell";

export default function PosLayout({ children }: { children: React.ReactNode }) {
	return <AppShell>{children}</AppShell>;
}
