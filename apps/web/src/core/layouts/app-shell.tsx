import type { ReactNode } from "react";
import { BottomNav, SideNav } from "./main-nav";

/** Layout del POS: navegación lateral en escritorio, inferior en móvil. */
export function AppShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-dvh">
			<SideNav />
			<main className="min-w-0 flex-1">{children}</main>
			<BottomNav />
		</div>
	);
}
