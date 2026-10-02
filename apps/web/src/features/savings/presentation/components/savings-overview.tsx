"use client";

import { AlertTriangleIcon, PiggyBankIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/core/components/empty-state";
import { StatCard } from "@/core/components/stat-card";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/ui/button";
import { Card } from "@/core/ui/card";
import { Skeleton } from "@/core/ui/skeleton";
import { formatMoney } from "@/core/utils/format";
import { isBehind, SAVINGS_PERIOD_META } from "../../domain/entities/savings.entity";
import { useSavingsGoals, useUpdateSavingsGoal } from "../hooks/use-savings";
import { GoalFormDialog } from "./goal-form-dialog";
import { SavingsGoalsTable } from "./savings-goals-table";

/**
 * Ahorros: total ahorrado, lo de cada meta y el cumplimiento de su cuota
 * semanal o mensual, con alerta cuando una meta va atrasada. Las metas son del
 * negocio, no de una caja.
 */
export function SavingsOverview() {
	const { data: goals = [], isLoading } = useSavingsGoals();
	const reactivate = useUpdateSavingsGoal();
	const [createOpen, setCreateOpen] = useState(false);

	const active = goals.filter((g) => g.activa);
	const archived = goals.filter((g) => !g.activa);
	const behind = active.filter(isBehind);
	const inProgress = active.filter((g) => g.periodoActual.estado !== "meta_completa");
	const totalSaved = active.reduce((sum, g) => sum + g.ahorrado, 0);
	const compliance = inProgress.length
		? Math.round(inProgress.reduce((sum, g) => sum + g.periodoActual.porcentaje, 0) / inProgress.length)
		: 100;

	if (isLoading) return <Skeleton className="h-96" />;

	return (
		<div className="flex flex-col gap-5">
			<div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
				<StatCard tone="yellow" label="Total ahorrado" value={formatMoney(totalSaved)} sub={`En ${active.length} ${active.length === 1 ? "meta" : "metas"}`} />
				<StatCard
					label="Falta por ahorrar"
					value={formatMoney(active.reduce((sum, g) => sum + Math.max(0, g.meta - g.ahorrado), 0))}
					sub={`De ${formatMoney(active.reduce((sum, g) => sum + g.meta, 0))} en metas`}
				/>
				<StatCard tone="green" label="Cumplimiento del periodo" value={`${compliance} %`} sub="Promedio de las cuotas actuales" />
				<StatCard
					tone={behind.length ? "orange" : "white"}
					label="Alertas"
					value={String(behind.length)}
					sub={behind.length ? `${behind.length === 1 ? "Meta atrasada" : "Metas atrasadas"}` : "Todo al día"}
					valueClassName={cn(behind.length > 0 && "text-destructive")}
				/>
			</div>

			{behind.length > 0 && (
				<div role="alert" className="flex items-start gap-3 rounded-2xl bg-destructive/10 p-4 text-destructive">
					<AlertTriangleIcon className="mt-0.5 size-5 shrink-0" />
					<div className="flex flex-col gap-1 text-sm">
						<strong className="text-[15px]">Hay metas que no se están cumpliendo</strong>
						{behind.map((g) => (
							<span key={g.id}>
								{g.periodo === "diario"
									? `${g.nombre}: ayer se ahorraron ${formatMoney(g.periodoActual.anterior.ahorrado)} de ${formatMoney(g.periodoActual.anterior.objetivo)}.`
									: `${g.nombre}: ${SAVINGS_PERIOD_META[g.periodo].current.toLowerCase()} llevas ${formatMoney(g.periodoActual.ahorrado)} de ${formatMoney(g.periodoActual.objetivo)} (${g.periodoActual.porcentaje} %).`}
							</span>
						))}
					</div>
				</div>
			)}

			<div className="flex items-center justify-between">
				<h2 className="font-display text-xl font-extrabold">Metas de ahorro</h2>
				<Button variant="dark" size="sm" onClick={() => setCreateOpen(true)}>
					<PlusIcon /> Nueva meta
				</Button>
			</div>

			{active.length === 0 ? (
				<Card>
					<EmptyState icon={<PiggyBankIcon />} title="Sin metas de ahorro">
						<Button className="mt-2" variant="dark" size="sm" onClick={() => setCreateOpen(true)}>
							Crear meta
						</Button>
					</EmptyState>
				</Card>
			) : (
				<SavingsGoalsTable goals={active} />
			)}

			{archived.length > 0 && (
				<section aria-label="Metas archivadas" className="flex flex-col gap-2">
					<h3 className="text-sm font-bold text-muted-foreground">Archivadas</h3>
					{archived.map((goal) => (
						<div key={goal.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted px-4 py-2.5 text-sm">
							<span>
								<strong>{goal.nombre}</strong> · {formatMoney(goal.ahorrado)} de {formatMoney(goal.meta)}
							</span>
							<Button
								size="sm"
								variant="outline"
								disabled={reactivate.isPending}
								onClick={() => reactivate.mutate({ id: goal.id, activa: true })}
							>
								Reactivar
							</Button>
						</div>
					))}
				</section>
			)}

			<GoalFormDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
