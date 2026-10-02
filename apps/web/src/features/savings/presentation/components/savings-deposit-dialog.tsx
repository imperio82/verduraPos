"use client";

import { useState } from "react";
import { Field } from "@/core/components/field";
import { MoneyInput } from "@/core/components/money-input";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { formatMoney } from "@/core/utils/format";
import { useActiveSession } from "@/features/cash-registers/presentation/hooks/use-active-session";
import { remainingToGoal, type SavingsGoalEntity } from "../../domain/entities/savings.entity";
import { useAddSavingsDeposit, useSavingsGoals } from "../hooks/use-savings";

const NO_CASH = "none";
const QUICK_AMOUNTS = [50_000, 100_000, 200_000];

interface Props {
	/** Meta fija ("+ Ahorrar" en su tarjeta). Sin ella, se elige entre las metas activas. */
	goal?: SavingsGoalEntity;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Desde el detalle de una caja: el dinero siempre sale de esa caja. */
	fixedSessionId?: string;
}

/**
 * "+ Ahorrar" / "Pasar a ahorro": aporte a una meta. Las metas no dependen de
 * una caja; solo el aporte puede salir del efectivo de una.
 */
export function SavingsDepositDialog({ goal, open, onOpenChange, fixedSessionId }: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				{/* El contenido se monta al abrir: el formulario arranca limpio cada vez. */}
				<DepositForm fixedGoal={goal} fixedSessionId={fixedSessionId} onDone={() => onOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}

function DepositForm({
	fixedGoal,
	fixedSessionId,
	onDone,
}: {
	fixedGoal?: SavingsGoalEntity;
	fixedSessionId?: string;
	onDone: () => void;
}) {
	const { openSessions } = useActiveSession();
	const { data: goals = [] } = useSavingsGoals();
	const deposit = useAddSavingsDeposit();
	const activeGoals = goals.filter((g) => g.activa);
	const [goalId, setGoalId] = useState(fixedGoal?.id ?? activeGoals[0]?.id ?? "");
	const [monto, setMonto] = useState(0);
	const [sessionId, setSessionId] = useState(fixedSessionId ?? NO_CASH);

	// Si las metas llegan después de abrir, se toma la primera.
	const goal = fixedGoal ?? activeGoals.find((g) => g.id === goalId) ?? activeGoals[0];

	if (!goal) {
		return (
			<DialogHeader>
				<DialogTitle>Sin metas de ahorro</DialogTitle>
				<DialogDescription>Crea una meta en Contabilidad para empezar a ahorrar.</DialogDescription>
			</DialogHeader>
		);
	}

	const submit = () =>
		deposit.mutate(
			{ goalId: goal.id, monto, cashSessionId: sessionId === NO_CASH ? undefined : sessionId },
			{ onSuccess: onDone },
		);

	return (
		<>
			<DialogHeader>
				<DialogTitle>{fixedGoal ? `Ahorrar para “${goal.nombre}”` : "Pasar a ahorro"}</DialogTitle>
				<DialogDescription>
					Llevas {formatMoney(goal.ahorrado)} de {formatMoney(goal.meta)} · faltan {formatMoney(remainingToGoal(goal))}
				</DialogDescription>
			</DialogHeader>
			{!fixedGoal && (
				<Field label="Meta">
					<Select value={goal.id} onValueChange={setGoalId}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{activeGoals.map((g) => (
								<SelectItem key={g.id} value={g.id}>
									{g.nombre} ({g.porcentaje} %)
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
			)}
			<Field label="Monto">
				<MoneyInput value={monto} onValueChange={setMonto} autoFocus />
			</Field>
			<div className="flex gap-2">
				{QUICK_AMOUNTS.map((amount) => (
					<Button key={amount} type="button" variant="outline" size="sm" onClick={() => setMonto(amount)}>
						{formatMoney(amount)}
					</Button>
				))}
			</div>
			{!fixedSessionId && (
				<Field label="¿De dónde sale el dinero?">
					<Select value={sessionId} onValueChange={setSessionId}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{openSessions.map((s) => (
								<SelectItem key={s.id} value={s.id}>
									Efectivo de {s.cajaNombre} ({s.cajero})
								</SelectItem>
							))}
							<SelectItem value={NO_CASH}>Por fuera de caja</SelectItem>
						</SelectContent>
					</Select>
				</Field>
			)}
			<DialogFooter>
				<Button variant="outline" onClick={onDone}>
					Cancelar
				</Button>
				<Button variant="dark" disabled={monto <= 0 || deposit.isPending} onClick={submit}>
					Ahorrar {monto > 0 && formatMoney(monto)}
				</Button>
			</DialogFooter>
		</>
	);
}
