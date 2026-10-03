"use client";

import { useState } from "react";
import { EmptyState } from "@/core/components/empty-state";
import { PageHeader } from "@/core/components/page-header";
import { StatCard } from "@/core/components/stat-card";
import { cn } from "@/core/lib/utils";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Skeleton } from "@/core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/ui/table";
import { formatMoney, formatSignedMoney, formatTime, toIsoDay } from "@/core/utils/format";
import { EXPENSE_CATEGORY_META, EXPENSE_PAYMENT_LABELS } from "@/features/expenses/domain/entities/expense.entity";
import { useDailyExpenses } from "@/features/expenses/presentation/hooks/use-daily-expenses";
import { SalesTable } from "../components/sales-table";
import { useDailySales } from "../hooks/use-daily-sales";

/** Ventas y egresos de un día, con sus totales. */
export function DailySalesPage() {
	const today = toIsoDay(new Date());
	const [day, setDay] = useState(today);
	const sales = useDailySales(day);
	const expenses = useDailyExpenses(day);

	const saleList = sales.data ?? [];
	const expenseList = expenses.data ?? [];
	const salesTotal = saleList.reduce((sum, s) => sum + s.total, 0);
	const expensesTotal = expenseList.reduce((sum, e) => sum + e.monto, 0);
	const net = salesTotal - expensesTotal;

	return (
		<div className="flex flex-col gap-5 p-4 pb-28 md:px-8 md:py-7 lg:pb-7">
			<PageHeader title={day === today ? "Ventas de hoy" : "Ventas del día"}>
				<Input
					type="date"
					aria-label="Día"
					className="w-auto"
					value={day}
					max={today}
					onChange={(e) => setDay(e.target.value || today)}
				/>
			</PageHeader>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
				<StatCard tone="green" label="Total en ventas" value={formatMoney(salesTotal)} sub={`${saleList.length} ventas`} />
				<StatCard tone="orange" label="Total en egresos" value={formatMoney(expensesTotal)} sub={`${expenseList.length} gastos`} />
				<StatCard
					tone="dark"
					label="Ventas menos egresos"
					value={formatSignedMoney(net)}
					valueClassName={cn(net < 0 && "text-destructive")}
				/>
			</div>

			<Card className="gap-0 overflow-hidden p-0">
				<CardHeader className="p-4 md:p-5">
					<CardTitle>Ventas</CardTitle>
					<CardDescription>Todas las cajas del día</CardDescription>
				</CardHeader>
				{sales.isLoading ? (
					<Skeleton className="m-4 h-40" />
				) : saleList.length === 0 ? (
					<EmptyState title="No hay ventas este día" />
				) : (
					<SalesTable sales={saleList} showRegister />
				)}
			</Card>

			<Card className="gap-0 overflow-hidden p-0">
				<CardHeader className="p-4 md:p-5">
					<CardTitle>Egresos</CardTitle>
					<CardDescription>Gastos y pagos registrados</CardDescription>
				</CardHeader>
				{expenses.isLoading ? (
					<Skeleton className="m-4 h-32" />
				) : expenseList.length === 0 ? (
					<EmptyState title="No hay egresos este día" />
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Hora</TableHead>
								<TableHead>Concepto</TableHead>
								<TableHead>Destino</TableHead>
								<TableHead>Pago</TableHead>
								<TableHead className="text-right">Monto</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{expenseList.map((expense) => {
								const meta = EXPENSE_CATEGORY_META[expense.destino];
								return (
									<TableRow key={expense.id}>
										<TableCell className="tabular whitespace-nowrap">{formatTime(expense.createdAt)}</TableCell>
										<TableCell className="font-semibold">{expense.concepto}</TableCell>
										<TableCell>
											<span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", meta.tint)}>{meta.label}</span>
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">{EXPENSE_PAYMENT_LABELS[expense.metodoPago]}</TableCell>
										<TableCell className="tabular text-right font-extrabold">− {formatMoney(expense.monto)}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
			</Card>
		</div>
	);
}
