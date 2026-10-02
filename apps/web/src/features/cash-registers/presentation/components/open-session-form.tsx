"use client";

import { useState } from "react";
import { Field } from "@/core/components/field";
import { MoneyInput } from "@/core/components/money-input";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import { formatMoney } from "@/core/utils/format";
import { useCashRegisters, useOpenCashSession } from "../hooks/use-cash-registers";
import { useActiveSessionStore } from "../store/active-session.store";

const QUICK_BASES = [100_000, 200_000];

/** Abrir caja: se cuenta el dinero con el que arranca el día (la base). */
export function OpenSessionForm({ onOpened }: { onOpened?: () => void }) {
	const { data: registers = [] } = useCashRegisters();
	const open = useOpenCashSession();
	const setActiveSession = useActiveSessionStore((s) => s.setSessionId);

	const closedRegisters = registers.filter((r) => !r.sesionAbierta);
	const [selectedId, setCashRegisterId] = useState("");
	const [cajero, setCajero] = useState("");
	const [base, setBase] = useState(200_000);
	const [nota, setNota] = useState("");

	// Si la caja elegida ya se abrió (o no hay elección), se toma la primera cerrada.
	const cashRegisterId = closedRegisters.some((r) => r.id === selectedId) ? selectedId : (closedRegisters[0]?.id ?? "");

	if (registers.length > 0 && closedRegisters.length === 0) {
		return <p className="text-sm text-muted-foreground">Todas las cajas están abiertas.</p>;
	}

	const submit = () =>
		open.mutate(
			{ cashRegisterId, cajero, base, notaApertura: nota },
			{
				onSuccess: (session) => {
					setActiveSession(session.id);
					setCajero("");
					setNota("");
					onOpened?.();
				},
			},
		);

	return (
		<div className="flex flex-col gap-4">
			<p className="text-sm text-muted-foreground">Cuenta el dinero con el que arrancas el día. Esa es la base de la caja.</p>
			<Field label="Caja">
				<Select value={cashRegisterId} onValueChange={setCashRegisterId}>
					<SelectTrigger>
						<SelectValue placeholder="Elige una caja" />
					</SelectTrigger>
					<SelectContent>
						{closedRegisters.map((r) => (
							<SelectItem key={r.id} value={r.id}>
								{r.nombre}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>
			<Field label="Cajero" htmlFor="cajero">
				<Input id="cajero" placeholder="Nombre de quien atiende" value={cajero} onChange={(e) => setCajero(e.target.value)} />
			</Field>
			<Field label="Base inicial en efectivo">
				<MoneyInput value={base} onValueChange={setBase} />
			</Field>
			<div className="flex gap-2">
				{QUICK_BASES.map((amount) => (
					<Button key={amount} type="button" variant="outline" size="sm" onClick={() => setBase(amount)}>
						{formatMoney(amount)}
					</Button>
				))}
			</div>
			<Field label="Nota (opcional)" htmlFor="nota">
				<Textarea id="nota" rows={3} value={nota} onChange={(e) => setNota(e.target.value)} />
			</Field>
			<Button size="lg" disabled={!cashRegisterId || !cajero.trim() || open.isPending} onClick={submit}>
				{open.isPending ? "Abriendo…" : "Abrir caja"}
			</Button>
		</div>
	);
}
