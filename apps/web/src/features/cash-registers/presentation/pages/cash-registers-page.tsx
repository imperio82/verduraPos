"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/core/components/empty-state";
import { PageHeader } from "@/core/components/page-header";
import { StatCard } from "@/core/components/stat-card";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Card, CardTitle } from "@/core/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Skeleton } from "@/core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/ui/table";
import { SegmentedControl } from "@/core/ui/toggle-group";
import { formatDateTime, formatMoney, formatSignedMoney, formatTime } from "@/core/utils/format";
import type { CashSessionStatus } from "../../domain/entities/cash-register.entity";
import { OpenSessionForm } from "../components/open-session-form";
import { useCashSessions } from "../hooks/use-cash-registers";

type Filter = "todas" | CashSessionStatus;

const FILTERS = [
	{ value: "todas", label: "Todas" },
	{ value: "abierta", label: "Abiertas" },
	{ value: "cerrada", label: "Cerradas" },
] as const satisfies readonly { value: Filter; label: string }[];

const DAYS = 7;

/** Si la caja cerró el mismo día que abrió, basta con la hora. */
const formatClosingTime = (abiertaEn: string, cerradaEn: string): string =>
	new Date(abiertaEn).toDateString() === new Date(cerradaEn).toDateString()
		? formatTime(cerradaEn)
		: formatDateTime(cerradaEn);

export function CashRegistersPage() {
	const [filter, setFilter] = useState<Filter>("todas");
	const [openDialog, setOpenDialog] = useState(false);
	const { data: sessions = [], isLoading } = useCashSessions({ dias: DAYS });

	const open = sessions.filter((s) => s.estado === "abierta");
	const visible = filter === "todas" ? sessions : sessions.filter((s) => s.estado === filter);
	const expectedInRegisters = open.reduce((sum, s) => sum + s.efectivoEsperado, 0);
	const closingDifferences = sessions.reduce((sum, s) => sum + (s.cierre?.diferencia ?? 0), 0);

	return (
		<div className="flex min-h-full">
			<section className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-28 md:px-8 md:py-7 lg:pb-7">
				<PageHeader title="Cajas">
					<SegmentedControl aria-label="Filtrar cajas" value={filter} onValueChange={setFilter} options={FILTERS} />
					<Badge variant="outline" className="h-10 px-4 text-sm">
						Últimos {DAYS} días
					</Badge>
					<Button variant="dark" className="ml-auto xl:hidden" onClick={() => setOpenDialog(true)}>
						<PlusIcon /> Abrir caja
					</Button>
				</PageHeader>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
					<StatCard tone="orange" label="Cajas abiertas ahora" value={open.length} />
					<StatCard label="Efectivo esperado en cajas" value={formatMoney(expectedInRegisters)} />
					<StatCard
						label={`Diferencias en cierres (${DAYS} días)`}
						value={formatSignedMoney(closingDifferences)}
						valueClassName={cn(closingDifferences < 0 && "text-destructive")}
					/>
				</div>

				<Card className="gap-0 overflow-hidden p-0">
					{isLoading ? (
						<Skeleton className="m-4 h-48" />
					) : visible.length === 0 ? (
						<EmptyState title="No hay cajas en este filtro" />
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Caja</TableHead>
									<TableHead>Apertura</TableHead>
									<TableHead>Cierre</TableHead>
									<TableHead className="text-right">Ventas</TableHead>
									<TableHead className="text-right">Gastos</TableHead>
									<TableHead className="text-right">Diferencia</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{visible.map((s) => {
									const isOpen = s.estado === "abierta";
									const dif = s.cierre?.diferencia;
									return (
										<TableRow key={s.id} className={cn(isOpen && "bg-tint-cream")}>
											<TableCell>
												<div className="font-bold">{s.cajaNombre}</div>
												<div className="text-sm text-muted-foreground">{s.cajero}</div>
											</TableCell>
											<TableCell className="whitespace-nowrap">{formatDateTime(s.abiertaEn)}</TableCell>
											<TableCell className="whitespace-nowrap">{s.cerradaEn ? formatClosingTime(s.abiertaEn, s.cerradaEn) : "—"}</TableCell>
											<TableCell className="tabular text-right font-bold">{formatMoney(s.totales.ventasTotal)}</TableCell>
											<TableCell className="tabular text-right">{formatMoney(s.totales.gastosTotal)}</TableCell>
											<TableCell
												className={cn(
													"tabular text-right font-bold",
													dif !== undefined && dif < 0 && "text-destructive",
													dif !== undefined && dif > 0 && "text-info",
												)}
											>
												{dif === undefined ? "—" : formatSignedMoney(dif)}
											</TableCell>
											<TableCell>
												<Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Abierta" : "Cerrada"}</Badge>
											</TableCell>
											<TableCell className="text-right">
												<Button asChild variant={isOpen ? "dark" : "outline"} size="sm">
													<Link href={`/cajas/${s.id}`}>{isOpen ? "Entrar" : "Ver cierre"}</Link>
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</Card>
			</section>

			<aside aria-label="Abrir caja" className="hidden w-[380px] shrink-0 border-l border-[#E7E0D0] bg-card p-7 xl:block">
				<CardTitle className="mb-4 text-2xl">Abrir caja</CardTitle>
				<OpenSessionForm />
			</aside>

			<Dialog open={openDialog} onOpenChange={setOpenDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Abrir caja</DialogTitle>
					</DialogHeader>
					<OpenSessionForm onOpened={() => setOpenDialog(false)} />
				</DialogContent>
			</Dialog>
		</div>
	);
}
