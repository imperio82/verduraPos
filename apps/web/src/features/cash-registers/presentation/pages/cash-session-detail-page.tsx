"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/core/components/empty-state";
import { StatCard } from "@/core/components/stat-card";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Progress } from "@/core/ui/progress";
import { Skeleton } from "@/core/ui/skeleton";
import { formatDateTime, formatMoney, formatTime } from "@/core/utils/format";
import { ExpenseDialog } from "@/features/expenses/presentation/components/expense-dialog";
import { SalesTable } from "@/features/sales/presentation/components/sales-table";
import { useSessionSales } from "@/features/sales/presentation/hooks/use-daily-sales";
import { SavingsDepositDialog } from "@/features/savings/presentation/components/savings-deposit-dialog";
import { useSavingsGoals } from "@/features/savings/presentation/hooks/use-savings";
import {
	type CashActivityType,
	PAYMENT_METHOD_LABELS,
	type PaymentMethod,
} from "../../domain/entities/cash-register.entity";
import { CashClosingPanel } from "../components/cash-closing-panel";
import { CashIncomeDialog } from "../components/cash-income-dialog";
import { useCashSessionDetail } from "../hooks/use-cash-registers";

const ACTIVITY_STYLE: Record<CashActivityType, { label: string; className: string; sign: string }> = {
	venta: { label: "Venta", className: "bg-tint-green text-success", sign: "+" },
	ingreso: { label: "Ingreso", className: "bg-tint-blue text-info", sign: "+" },
	gasto: { label: "Gasto", className: "bg-tint-orange text-warning", sign: "−" },
	ahorro: { label: "Ahorro", className: "bg-tint-yellow text-[#5A4A12]", sign: "−" },
	danado: { label: "Dañado", className: "bg-destructive/10 text-destructive", sign: "" },
	reconteo: { label: "Reconteo", className: "bg-tint-purple text-violet", sign: "" },
	apertura: { label: "Apertura", className: "bg-secondary", sign: "" },
};

const METHOD_COLORS: Record<PaymentMethod, string> = {
	efectivo: "bg-ring",
	transferencia: "bg-info",
	tarjeta: "bg-violet",
};

export function CashSessionDetailPage({ sessionId }: { sessionId: string }) {
	const { data: session, isLoading } = useCashSessionDetail(sessionId);
	const { data: sales = [], isLoading: salesLoading } = useSessionSales(sessionId);
	const { data: goals = [] } = useSavingsGoals();
	const hasGoals = goals.some((g) => g.activa);
	const [dialog, setDialog] = useState<"income" | "expense" | "savings" | "close" | null>(null);

	if (isLoading || !session) {
		return (
			<div className="flex flex-col gap-4 p-4 md:p-8">
				<Skeleton className="h-12 w-64" />
				<Skeleton className="h-28" />
				<Skeleton className="h-80" />
			</div>
		);
	}

	const isOpen = session.estado === "abierta";
	const { totales } = session;
	const closeDialog = (open: boolean) => !open && setDialog(null);

	return (
		<div className="flex min-h-full flex-col pb-28 md:pb-0 xl:flex-row">
			<section className="flex min-w-0 flex-1 flex-col gap-5 p-4 md:px-8 md:py-7">
				<div className="flex flex-wrap items-center gap-3">
					<Button asChild variant="outline" size="icon" aria-label="Volver a cajas">
						<Link href="/cajas">
							<ArrowLeftIcon />
						</Link>
					</Button>
					<div className="mr-auto">
						<div className="flex items-center gap-3">
							<h1 className="font-display text-3xl font-extrabold">{session.cajaNombre}</h1>
							<Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Abierta" : "Cerrada"}</Badge>
						</div>
						<span className="text-sm text-muted-foreground">
							{session.cajero} · abierta {formatDateTime(session.abiertaEn).toLowerCase()} con base de{" "}
							{formatMoney(session.base)}
						</span>
					</div>
					{isOpen && (
						<div className="flex flex-wrap gap-2">
							<Button variant="outline" onClick={() => setDialog("income")}>
								+ Ingreso
							</Button>
							<Button variant="outline" onClick={() => setDialog("expense")}>
								− Egreso / gasto
							</Button>
							<Button variant="secondary" onClick={() => setDialog("savings")} disabled={!hasGoals}>
								Pasar a ahorro
							</Button>
							<Button variant="dark" onClick={() => setDialog("close")}>
								Cerrar caja
							</Button>
						</div>
					)}
				</div>

				<div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-5">
					<StatCard label="Base de apertura" value={formatMoney(session.base)} sub={formatTime(session.abiertaEn)} />
					<StatCard tone="green" label="Ventas" value={formatMoney(totales.ventasTotal)} sub={`${totales.ventasCount} ventas`} />
					<StatCard tone="blue" label="Otros ingresos" value={formatMoney(totales.ingresosTotal)} sub={`${totales.ingresosCount} movimientos`} />
					<StatCard
						tone="orange"
						label="Egresos (gastos)"
						value={formatMoney(totales.gastosTotal)}
						sub={
							totales.gastosEfectivo === totales.gastosTotal
								? `${totales.gastosCount} pagos`
								: `${totales.gastosCount} pagos · ${formatMoney(totales.gastosEfectivo)} en efectivo`
						}
					/>
					<StatCard tone="yellow" label="Enviado a ahorro" value={formatMoney(totales.ahorroTotal)} />
					<StatCard
						label="Producto dañado"
						value={formatMoney(totales.danadosCosto)}
						sub={`${totales.danadosCount} registros · no afecta el efectivo`}
					/>
				</div>

				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
					<Card>
						<CardTitle>Ventas por método</CardTitle>
						{(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => {
							const value = totales.ventasPorMetodo[method];
							const pct = totales.ventasTotal ? Math.round((value / totales.ventasTotal) * 100) : 0;
							return (
								<div key={method} className="flex flex-col gap-1.5">
									<div className="flex justify-between text-[15px]">
										<span className="font-semibold">{PAYMENT_METHOD_LABELS[method]}</span>
										<span className="tabular font-bold">
											{formatMoney(value)} <span className="font-normal text-muted-foreground">· {pct} %</span>
										</span>
									</div>
									<Progress value={pct} indicatorClassName={METHOD_COLORS[method]} className="h-2.5" />
								</div>
							);
						})}
						<p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
							Solo el efectivo se cuenta en el cierre. Transferencias y tarjeta se concilian aparte.
						</p>
					</Card>

					<Card className="gap-2">
						<CardHeader>
							<CardTitle>Ingresos y egresos</CardTitle>
							<CardDescription>{totales.ventasCount} ventas agrupadas por hora</CardDescription>
						</CardHeader>
						{session.actividad.length === 0 && <EmptyState title="Sin movimientos" />}
						{session.actividad.map((item, i) => {
							const style = ACTIVITY_STYLE[item.tipo];
							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: la actividad no tiene id propio
								<div key={i} className="flex items-center gap-3 border-b border-[#EFE8D6] py-2.5 last:border-0">
									<span className="tabular w-20 shrink-0 whitespace-nowrap text-sm text-muted-foreground">{formatTime(item.fecha)}</span>
									<span className={cn("w-20 shrink-0 rounded-full px-2 py-1 text-center text-xs font-bold", style.className)}>
										{style.label}
									</span>
									<span className="flex min-w-0 flex-1 flex-col">
										<span className="truncate">{item.detalle}</span>
										{item.tipo === "gasto" && item.afectaEfectivo === false && (
											<span className="text-xs text-muted-foreground">Transferencia · no sale de la caja</span>
										)}
									</span>
									<span className={cn("tabular font-extrabold", item.afectaEfectivo === false && "text-muted-foreground")}>
										{item.tipo === "reconteo"
											? "—"
											: `${item.afectaEfectivo === false || !style.sign ? "" : `${style.sign} `}${formatMoney(item.monto)}`}
									</span>
								</div>
							);
						})}
					</Card>
				</div>

				<Card className="gap-0 overflow-hidden p-0">
					<CardHeader className="p-4 md:p-5">
						<div>
							<CardTitle>Ventas realizadas</CardTitle>
							<CardDescription>
								{sales.length} ventas · {formatMoney(sales.reduce((sum, s) => sum + s.total, 0))}
							</CardDescription>
						</div>
					</CardHeader>
					{salesLoading ? (
						<Skeleton className="m-4 h-32" />
					) : sales.length === 0 ? (
						<EmptyState title="Todavía no hay ventas en esta caja" />
					) : (
						<SalesTable sales={sales} />
					)}
				</Card>
			</section>

			{/* Cerrada: el resumen del cierre queda a la vista. Abierta: el cierre se hace en el modal. */}
			{!isOpen && (
				<aside aria-label="Cierre de caja" className="shrink-0 border-t border-[#E7E0D0] bg-card p-5 md:p-7 xl:w-[400px] xl:border-t-0 xl:border-l">
					<h2 className="mb-4 font-display text-2xl font-extrabold">Cierre de caja</h2>
					<CashClosingPanel session={session} />
				</aside>
			)}

			<Dialog open={dialog === "close" && isOpen} onOpenChange={closeDialog}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Cierre de caja</DialogTitle>
					</DialogHeader>
					<CashClosingPanel session={session} />
				</DialogContent>
			</Dialog>

			<CashIncomeDialog sessionId={session.id} open={dialog === "income"} onOpenChange={closeDialog} />
			<ExpenseDialog fixedSessionId={session.id} open={dialog === "expense"} onOpenChange={closeDialog} />
			<SavingsDepositDialog fixedSessionId={session.id} open={dialog === "savings"} onOpenChange={closeDialog} />
		</div>
	);
}
