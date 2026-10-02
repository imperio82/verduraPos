"use client";

import Link from "next/link";
import { Button } from "@/core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import type { CashSessionSummary } from "../../domain/entities/cash-register.entity";

/** "Caja 1 · Marta" con selector cuando hay varias cajas abiertas. */
export function ActiveSessionPicker({
	session,
	openSessions,
	onSelect,
}: {
	session: CashSessionSummary | null;
	openSessions: CashSessionSummary[];
	onSelect: (id: string) => void;
}) {
	if (!session) {
		return (
			<Button asChild size="sm" variant="dark">
				<Link href="/cajas">Abrir una caja</Link>
			</Button>
		);
	}

	if (openSessions.length === 1) {
		return (
			<span className="text-sm text-muted-foreground">
				{session.cajaNombre} · {session.cajero}
			</span>
		);
	}

	return (
		<Select value={session.id} onValueChange={onSelect}>
			<SelectTrigger className="h-9 w-auto border-0 bg-muted text-sm" aria-label="Caja activa">
				<SelectValue />
			</SelectTrigger>
			<SelectContent align="end">
				{openSessions.map((s) => (
					<SelectItem key={s.id} value={s.id}>
						{s.cajaNombre} · {s.cajero}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
