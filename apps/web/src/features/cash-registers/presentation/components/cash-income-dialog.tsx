"use client";

import { useState } from "react";
import { Field } from "@/core/components/field";
import { MoneyInput } from "@/core/components/money-input";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { useAddCashIncome } from "../hooks/use-cash-registers";

/** "+ Ingreso": dinero que entra a la caja y no es venta (sencillo, préstamo...). */
export function CashIncomeDialog({
	sessionId,
	open,
	onOpenChange,
}: {
	sessionId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const add = useAddCashIncome(sessionId);
	const [concepto, setConcepto] = useState("");
	const [monto, setMonto] = useState(0);

	const submit = () =>
		add.mutate(
			{ concepto, monto },
			{
				onSuccess: () => {
					setConcepto("");
					setMonto(0);
					onOpenChange(false);
				},
			},
		);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Registrar ingreso</DialogTitle>
					<DialogDescription>Dinero que entra a la caja y no es una venta.</DialogDescription>
				</DialogHeader>
				<Field label="Concepto" htmlFor="income-concept">
					<Input
						id="income-concept"
						placeholder="Ej.: Sencillo traído del banco"
						value={concepto}
						onChange={(e) => setConcepto(e.target.value)}
					/>
				</Field>
				<Field label="Monto">
					<MoneyInput value={monto} onValueChange={setMonto} />
				</Field>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button variant="dark" disabled={!concepto.trim() || monto <= 0 || add.isPending} onClick={submit}>
						Registrar ingreso
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
