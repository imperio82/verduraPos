"use client";

import { useState } from "react";
import { Field } from "@/core/components/field";
import { MoneyInput } from "@/core/components/money-input";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { SegmentedControl } from "@/core/ui/toggle-group";
import {
	periodsToComplete,
	SAVINGS_PERIOD_META,
	SAVINGS_PERIODS,
	type SavingsGoalEntity,
	type SavingsPeriod,
} from "../../domain/entities/savings.entity";
import { useSaveSavingsGoal, useUpdateSavingsGoal } from "../hooks/use-savings";

const PERIOD_OPTIONS = SAVINGS_PERIODS.map((value) => ({ value, label: SAVINGS_PERIOD_META[value].label }));

/** Crear una meta o editar la que se pasa en `goal`. */
export function GoalFormDialog({
	goal,
	open,
	onOpenChange,
}: {
	goal?: SavingsGoalEntity;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				{/* El formulario se monta al abrir: arranca con los datos de la meta o vacío. */}
				<GoalForm goal={goal} onDone={() => onOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}

function GoalForm({ goal, onDone }: { goal?: SavingsGoalEntity; onDone: () => void }) {
	const save = useSaveSavingsGoal();
	const update = useUpdateSavingsGoal();
	const [nombre, setNombre] = useState(goal?.nombre ?? "");
	const [meta, setMeta] = useState(goal?.meta ?? 0);
	const [periodo, setPeriodo] = useState<SavingsPeriod>(goal?.periodo ?? "mensual");
	const [aportePeriodo, setAportePeriodo] = useState(goal?.aportePeriodo ?? 0);

	const periodMeta = SAVINGS_PERIOD_META[periodo];
	const periods = periodsToComplete(meta, aportePeriodo);
	const valid = nombre.trim().length >= 2 && meta > 0 && aportePeriodo > 0 && aportePeriodo <= meta;

	const submit = () => save.mutate({ id: goal?.id, nombre, meta, periodo, aportePeriodo }, { onSuccess: onDone });

	return (
		<>
			<DialogHeader>
				<DialogTitle>{goal ? "Editar meta" : "Nueva meta de ahorro"}</DialogTitle>
				<DialogDescription>Elige cada cuánto vas a ahorrar y cuánto. Te avisamos si te atrasas.</DialogDescription>
			</DialogHeader>
			<Field label="Nombre de la meta" htmlFor="goal-name">
				<Input id="goal-name" placeholder="Ej.: Nevera exhibidora" value={nombre} onChange={(e) => setNombre(e.target.value)} />
			</Field>
			<Field label="Valor de la meta">
				<MoneyInput value={meta} onValueChange={setMeta} />
			</Field>
			<Field label="¿Cada cuánto ahorras?">
				<SegmentedControl aria-label="Periodo de ahorro" value={periodo} onValueChange={setPeriodo} options={PERIOD_OPTIONS} />
			</Field>
			<Field
				label={periodMeta.quota}
				error={aportePeriodo > meta && meta > 0 ? "La cuota no puede ser mayor que la meta" : undefined}
			>
				<MoneyInput value={aportePeriodo} onValueChange={setAportePeriodo} />
			</Field>
			{valid && (
				<p className="rounded-xl bg-tint-yellow p-3 text-sm">
					Ahorrando esa cuota cada {periodMeta.unit} completas la meta en{" "}
					<strong>
						{periods} {periods === 1 ? periodMeta.unit : periodMeta.units}
					</strong>
					.
				</p>
			)}
			<DialogFooter>
				{goal && (
					<Button
						variant="ghost"
						className="text-destructive sm:mr-auto"
						disabled={update.isPending}
						onClick={() => update.mutate({ id: goal.id, activa: false }, { onSuccess: onDone })}
					>
						Archivar meta
					</Button>
				)}
				<Button variant="outline" onClick={onDone}>
					Cancelar
				</Button>
				<Button variant="dark" disabled={!valid || save.isPending} onClick={submit}>
					{goal ? "Guardar cambios" : "Crear meta"}
				</Button>
			</DialogFooter>
		</>
	);
}
