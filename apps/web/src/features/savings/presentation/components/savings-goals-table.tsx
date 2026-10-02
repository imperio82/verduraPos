"use client";

import { AlertTriangleIcon, CheckCircle2Icon, ChevronDownIcon, PartyPopperIcon, PencilIcon, TrendingUpIcon } from "lucide-react";
import { Fragment, type ReactNode, useState } from "react";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Card } from "@/core/ui/card";
import { Progress } from "@/core/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/ui/table";
import { formatMoney, formatShortDate } from "@/core/utils/format";
import {
	remainingThisPeriod,
	remainingToGoal,
	SAVINGS_PERIOD_META,
	type SavingsGoalEntity,
	type SavingsPeriodStatus,
} from "../../domain/entities/savings.entity";
import { GoalFormDialog } from "./goal-form-dialog";
import { SavingsDepositDialog } from "./savings-deposit-dialog";

const STATUS: Record<SavingsPeriodStatus, { label: string; pill: string; bar: string; icon: ReactNode }> = {
	cumplida: { label: "Cumplida", pill: "bg-tint-green text-success", bar: "bg-success", icon: <CheckCircle2Icon /> },
	al_dia: { label: "Al día", pill: "bg-secondary text-foreground", bar: "bg-brand-yellow", icon: <TrendingUpIcon /> },
	atrasada: { label: "Atrasada", pill: "bg-destructive/10 text-destructive", bar: "bg-destructive", icon: <AlertTriangleIcon /> },
	meta_completa: { label: "Completa", pill: "bg-tint-green text-success", bar: "bg-success", icon: <PartyPopperIcon /> },
};

/** Explicación del estado de la cuota del periodo. */
const statusMessage = (goal: SavingsGoalEntity): string => {
	const { periodoActual: p } = goal;
	const period = SAVINGS_PERIOD_META[goal.periodo];
	const falta = formatMoney(remainingThisPeriod(goal));
	switch (p.estado) {
		case "meta_completa":
			return "¡Meta completa!";
		case "cumplida":
			return `Cuota de ${period.current.toLowerCase()} cumplida.`;
		case "al_dia":
			return `Vas al día. Faltan ${falta} para la cuota de ${period.current.toLowerCase()}.`;
		case "atrasada":
			return goal.periodo === "diario"
				? `Ayer no se cumplió la cuota: se ahorraron ${formatMoney(p.anterior.ahorrado)} de ${formatMoney(p.anterior.objetivo)}. Hoy faltan ${falta}.`
				: `Vas atrasado: a hoy deberías llevar ${formatMoney(p.esperadoALaFecha)}. Faltan ${falta} para la cuota.`;
	}
};

/** Metas de ahorro en tabla: una fila por meta y el detalle al desplegarla. */
export function SavingsGoalsTable({ goals }: { goals: SavingsGoalEntity[] }) {
	return (
		<Card className="gap-0 overflow-hidden p-0">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-8" />
						<TableHead>Meta</TableHead>
						<TableHead>Ahorrado</TableHead>
						<TableHead className="text-right">Falta</TableHead>
						<TableHead>Periodo actual</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{goals.map((goal) => (
						<GoalRow key={goal.id} goal={goal} />
					))}
				</TableBody>
			</Table>
		</Card>
	);
}

function GoalRow({ goal }: { goal: SavingsGoalEntity }) {
	const [expanded, setExpanded] = useState(false);
	const [depositOpen, setDepositOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const period = SAVINGS_PERIOD_META[goal.periodo];
	const { periodoActual: p } = goal;
	const status = STATUS[p.estado];
	const complete = p.estado === "meta_completa";
	const detailId = `goal-detail-${goal.id}`;

	return (
		<Fragment>
			<TableRow
				className={cn("cursor-pointer", p.estado === "atrasada" && "bg-destructive/5")}
				// Toda la fila despliega el detalle; los botones (flecha, editar, ahorrar) hacen lo suyo.
				// Los diálogos se abren en un portal pero sus clics suben por React: solo cuenta lo que está en la fila.
				onClick={(e) => {
					const target = e.target as HTMLElement;
					if (e.currentTarget.contains(target) && !target.closest("button")) setExpanded((v) => !v);
				}}
			>
				<TableCell className="pr-0">
					<Button
						variant="ghost"
						size="icon-sm"
						aria-expanded={expanded}
						aria-controls={detailId}
						aria-label={expanded ? `Ocultar detalle de ${goal.nombre}` : `Ver detalle de ${goal.nombre}`}
						onClick={() => setExpanded((v) => !v)}
					>
						<ChevronDownIcon className={cn("transition-transform", expanded && "rotate-180")} />
					</Button>
				</TableCell>
				<TableCell>
					<div className="font-bold">{goal.nombre}</div>
					<div className="text-sm whitespace-nowrap text-muted-foreground">
						{period.label} · {formatMoney(goal.aportePeriodo)}
					</div>
				</TableCell>
				<TableCell className="min-w-44">
					<div className="flex items-baseline justify-between gap-3 text-sm">
						<span className="tabular font-bold whitespace-nowrap">
							{formatMoney(goal.ahorrado)} <span className="font-normal text-muted-foreground">de {formatMoney(goal.meta)}</span>
						</span>
						<span className="tabular font-extrabold">{goal.porcentaje} %</span>
					</div>
					<Progress value={goal.porcentaje} className="mt-1.5 h-1.5" indicatorClassName="bg-brand-yellow" />
				</TableCell>
				<TableCell className="text-right whitespace-nowrap">
					<div className="tabular font-semibold">{complete ? "—" : formatMoney(remainingToGoal(goal))}</div>
					{!complete && (
						<div className="text-xs text-muted-foreground">
							~{goal.periodosRestantes} {goal.periodosRestantes === 1 ? period.unit : period.units}
						</div>
					)}
				</TableCell>
				<TableCell className="min-w-40">
					{complete ? (
						<span className="text-sm text-muted-foreground">—</span>
					) : (
						<>
							<div className="flex items-baseline justify-between gap-3 text-sm">
								<span className="whitespace-nowrap">
									<span className="font-semibold">{period.current}:</span>{" "}
									<span className="tabular">
										{formatMoney(p.ahorrado)} / {formatMoney(p.objetivo)}
									</span>
								</span>
								<span className="tabular font-extrabold">{p.porcentaje} %</span>
							</div>
							<Progress value={p.porcentaje} className="mt-1.5 h-1.5" indicatorClassName={status.bar} />
						</>
					)}
				</TableCell>
				<TableCell>
					<span
						className={cn(
							"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap [&_svg]:size-3.5",
							status.pill,
						)}
					>
						{status.icon}
						{status.label}
					</span>
				</TableCell>
				<TableCell className="text-right whitespace-nowrap">
					<Button size="icon-sm" variant="ghost" aria-label={`Editar ${goal.nombre}`} onClick={() => setEditOpen(true)}>
						<PencilIcon />
					</Button>
					<Button size="sm" variant="dark" className="ml-1" onClick={() => setDepositOpen(true)}>
						+ Ahorrar
					</Button>
				</TableCell>
			</TableRow>

			{expanded && (
				<TableRow id={detailId} className="bg-muted/40 hover:bg-muted/40">
					<TableCell />
					<TableCell colSpan={6} className="py-3 whitespace-normal">
						<div className="grid gap-4 text-sm md:grid-cols-3">
							<div className="flex flex-col gap-1">
								<span className="text-xs font-bold text-muted-foreground">Estado</span>
								<span className={cn("font-semibold", p.estado === "atrasada" && "text-destructive")}>{statusMessage(goal)}</span>
								{!complete && (
									<span className="text-muted-foreground">
										{period.current}: {formatShortDate(p.desde)}
										{goal.periodo !== "diario" && ` – ${formatShortDate(p.hasta)}`}
									</span>
								)}
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-xs font-bold text-muted-foreground">{period.previous}</span>
								{p.anterior.aplica ? (
									<span className="tabular">
										{formatMoney(p.anterior.ahorrado)} de {formatMoney(p.anterior.objetivo)} ·{" "}
										<span className={cn("font-semibold", p.anterior.cumplido ? "text-success" : "text-destructive")}>
											{p.anterior.cumplido ? "cumplida" : "no cumplida"}
										</span>
									</span>
								) : (
									<span className="text-muted-foreground">La meta aún no existía</span>
								)}
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-xs font-bold text-muted-foreground">Últimos aportes</span>
								{goal.ultimosAportes.length === 0 && <span className="text-muted-foreground">Sin aportes todavía</span>}
								{goal.ultimosAportes.slice(0, 3).map((aporte) => (
									<span key={aporte.id} className="flex items-center justify-between gap-2">
										<span className="text-muted-foreground">
											{formatShortDate(aporte.createdAt)}
											{aporte.cashSessionId && (
												<Badge variant="outline" className="ml-2">
													desde caja
												</Badge>
											)}
										</span>
										<span className="tabular font-bold">+ {formatMoney(aporte.monto)}</span>
									</span>
								))}
							</div>
						</div>
					</TableCell>
				</TableRow>
			)}

			<SavingsDepositDialog goal={goal} open={depositOpen} onOpenChange={setDepositOpen} />
			<GoalFormDialog goal={goal} open={editOpen} onOpenChange={setEditOpen} />
		</Fragment>
	);
}
