"use client";

import { useState } from "react";
import { Field } from "@/core/components/field";
import { MoneyInput } from "@/core/components/money-input";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Textarea } from "@/core/ui/textarea";
import { formatMoney } from "@/core/utils/format";
import { useCashRegisters, useCreateCashRegister, useOpenCashSession } from "../hooks/use-cash-registers";
import { useActiveSessionStore } from "../store/active-session.store";

const QUICK_BASES = [100_000, 200_000];

/**
 * Abrir caja: se cuenta el dinero con el que arranca el día (la base).
 * No se elige caja: se usa la primera libre y, si no hay, se crea una
 * ("Caja 1", "Caja 2"…) en el mismo paso.
 */
export function OpenSessionForm({ onOpened }: { onOpened?: () => void }) {
	const { data: registers = [], isLoading } = useCashRegisters();
	const create = useCreateCashRegister();
	const open = useOpenCashSession();
	const setActiveSession = useActiveSessionStore((s) => s.setSessionId);

	const freeRegister = registers.find((r) => !r.sesionAbierta);
	const [cajero, setCajero] = useState("");
	const [base, setBase] = useState(200_000);
	const [nota, setNota] = useState("");
	const isPending = create.isPending || open.isPending;

	const submit = async () => {
		let id = freeRegister?.id;
		if (!id) {
			try {
				id = (await create.mutateAsync(`Caja ${registers.length + 1}`)).id;
			} catch {
				return; // el hook ya mostró el error
			}
		}
		open.mutate(
			{ cashRegisterId: id, cajero, base, notaApertura: nota },
			{
				onSuccess: (session) => {
					setActiveSession(session.id);
					setCajero("");
					setNota("");
					onOpened?.();
				},
			},
		);
	};

	return (
		<div className="flex flex-col gap-4">
			<p className="text-sm text-muted-foreground">Cuenta el dinero con el que arrancas el día. Esa es la base de la caja.</p>
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
			<Button size="lg" disabled={isLoading || !cajero.trim() || isPending} onClick={submit}>
				{isPending ? "Abriendo…" : "Abrir caja"}
			</Button>
		</div>
	);
}
