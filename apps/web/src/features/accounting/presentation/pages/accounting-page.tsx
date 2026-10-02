"use client";

import { CalendarRangeIcon, PlusIcon, ReceiptIcon } from "lucide-react";
import { useState } from "react";
import { DateRangeDialog } from "@/core/components/date-range-dialog";
import { EmptyState } from "@/core/components/empty-state";
import { PageHeader } from "@/core/components/page-header";
import { StatCard } from "@/core/components/stat-card";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/ui/button";
import { Card, CardHeader, CardTitle } from "@/core/ui/card";
import { Skeleton } from "@/core/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/tabs";
import { SegmentedControl } from "@/core/ui/toggle-group";
import { formatMoney, formatShortDate, formatTime } from "@/core/utils/format";
import { PERIOD_LABELS, PERIOD_OPTIONS, type PeriodPreset, presetToRange } from "@/core/utils/period";
import { EXPENSE_CATEGORY_META } from "@/features/expenses/domain/entities/expense.entity";
import { ExpenseDialog } from "@/features/expenses/presentation/components/expense-dialog";
import { isBehind } from "@/features/savings/domain/entities/savings.entity";
import { SavingsOverview } from "@/features/savings/presentation/components/savings-overview";
import { useSavingsGoals } from "@/features/savings/presentation/hooks/use-savings";
import { BalanceChart } from "../components/balance-chart";
import { useAccountingSummary } from "../hooks/use-accounting-summary";

/**
 * Contabilidad por secciones, como Inventario:
 * - Resumen: ventas, gastos y dinero final del periodo elegido (hoy, 2 días,
 *   semana, mes o fechas libres), con el destino de los pagos.
 * - Ahorros: metas, cumplimiento de su cuota y alertas.
 */
export function AccountingPage() {
	const [tab, setTab] = useState("resumen");
	const [expenseOpen, setExpenseOpen] = useState(false);
	const { data: goals = [] } = useSavingsGoals();
	const alerts = goals.filter(isBehind).length;

	return (
		<Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-5 p-4 pb-28 md:px-8 md:py-7 lg:pb-7">
			<PageHeader title="Contabilidad">
				<div className="md:flex-1">
					<TabsList aria-label="Secciones de contabilidad">
						<TabsTrigger value="resumen">Resumen</TabsTrigger>
						<TabsTrigger value="ahorros">
							Ahorros
							{alerts > 0 && (
								<span
									role="img"
									aria-label={`${alerts} ${alerts === 1 ? "meta atrasada" : "metas atrasadas"}`}
									className="flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-white"
								>
									{alerts}
								</span>
							)}
						</TabsTrigger>
					</TabsList>
				</div>
				{tab === "resumen" && (
					<Button variant="dark" className="w-full md:w-auto" onClick={() => setExpenseOpen(true)}>
						<PlusIcon /> Registrar gasto
					</Button>
				)}
			</PageHeader>

			<TabsContent value="resumen">
				<SummarySection />
			</TabsContent>
			<TabsContent value="ahorros">
				<SavingsOverview />
			</TabsContent>

			<ExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} />
		</Tabs>
	);
}

/** Resumen del periodo: indicadores, gastos y pagos, y la gráfica de la semana. */
function SummarySection() {
	const [preset, setPreset] = useState<PeriodPreset>("hoy");
	const [range, setRange] = useState(() => presetToRange("hoy"));
	const [rangeOpen, setRangeOpen] = useState(false);

	const { data, isLoading } = useAccountingSummary(range);
	const periodLabel = PERIOD_LABELS[preset];
	const isMultiDay = range.from !== range.to;

	const selectPreset = (value: PeriodPreset) => {
		setPreset(value);
		if (value !== "rango") setRange(presetToRange(value));
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-wrap items-center gap-2">
				<SegmentedControl aria-label="Periodo" value={preset} onValueChange={selectPreset} options={PERIOD_OPTIONS} />
				<Button variant={preset === "rango" ? "dark" : "outline"} onClick={() => setRangeOpen(true)}>
					<CalendarRangeIcon />
					{preset === "rango" ? `${formatShortDate(`${range.from}T12:00`)} – ${formatShortDate(`${range.to}T12:00`)}` : "Elegir fechas"}
				</Button>
			</div>

			<div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
				{isLoading || !data ? (
					Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28" />)
				) : (
					<>
						<StatCard tone="green" label={`Ventas ${periodLabel}`} value={formatMoney(data.ventas.total)} sub={`${data.ventas.count} ventas`} />
						<StatCard tone="orange" label={`Gastos ${periodLabel}`} value={formatMoney(data.gastos.total)} sub={`${data.gastos.count} pagos`} />
						<StatCard
							tone="dark"
							label="Dinero final"
							value={formatMoney(data.dineroFinal)}
							sub="Ventas − gastos"
							valueClassName={cn(data.dineroFinal < 0 && "text-[#FF9A8A]")}
						/>
						<StatCard
							tone="yellow"
							label="Ahorrado"
							value={formatMoney(data.ahorro.ahorrado)}
							sub={
								data.ahorro.metas.length === 0
									? "Sin metas activas"
									: `En ${data.ahorro.metas.length} ${data.ahorro.metas.length === 1 ? "meta" : "metas"} · ver Ahorros`
							}
						/>
					</>
				)}
			</div>

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
				<Card className="gap-2">
					<CardHeader>
						<CardTitle>Gastos y pagos {periodLabel === "del día" ? "de hoy" : periodLabel}</CardTitle>
					</CardHeader>
					{data?.gastos.items.length === 0 && <EmptyState icon={<ReceiptIcon />} title="Sin gastos en este periodo" />}
					<div className="flex flex-col">
						{data?.gastos.items.map((gasto) => (
							<div key={gasto.id} className="flex items-center gap-3 border-b border-[#EFE8D6] py-3 last:border-0">
								<span className="tabular w-16 shrink-0 text-sm text-muted-foreground">
									{isMultiDay ? formatShortDate(gasto.createdAt) : formatTime(gasto.createdAt)}
								</span>
								<span className="min-w-0 flex-1 truncate font-semibold">{gasto.concepto}</span>
								<span
									className={cn(
										"hidden rounded-full px-3 py-1 text-xs font-bold sm:inline",
										EXPENSE_CATEGORY_META[gasto.destino].tint,
									)}
								>
									{EXPENSE_CATEGORY_META[gasto.destino].label}
								</span>
								<span className="tabular w-24 text-right font-extrabold">{formatMoney(gasto.monto)}</span>
							</div>
						))}
					</div>
					{data && data.gastos.count > 0 && (
						<div className="flex justify-between rounded-xl bg-muted px-4 py-3 font-bold">
							<span>Total gastos</span>
							<span className="tabular">{formatMoney(data.gastos.total)}</span>
						</div>
					)}
				</Card>

				<Card className="self-start">
					<CardHeader>
						<CardTitle>{isMultiDay && data && data.serie.length > 7 ? "Por día" : "Esta semana"}</CardTitle>
					</CardHeader>
					{data ? <BalanceChart serie={data.serie} /> : <Skeleton className="h-40" />}
				</Card>
			</div>

			<DateRangeDialog
				key={`${range.from}-${range.to}`}
				open={rangeOpen}
				onOpenChange={setRangeOpen}
				initial={range}
				onApply={(next) => {
					setPreset("rango");
					setRange(next);
				}}
			/>
		</div>
	);
}
