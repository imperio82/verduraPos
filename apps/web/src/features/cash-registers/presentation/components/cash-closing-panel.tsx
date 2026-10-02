"use client";

import { useState } from "react";
import { Field } from "@/core/components/field";
import { MoneyInput } from "@/core/components/money-input";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { formatMoney, formatSignedMoney } from "@/core/utils/format";
import {
	type CashSessionDetail,
	countedCash,
	DENOMINATIONS,
	differenceLabel,
	expectedCashBreakdown,
} from "../../domain/entities/cash-register.entity";
import { useCloseCashSession } from "../hooks/use-cash-registers";

/** Cierre de caja: efectivo esperado vs. conteo de billetes. */
export function CashClosingPanel({ session }: { session: CashSessionDetail }) {
	const close = useCloseCashSession(session.id);
	const [quantities, setQuantities] = useState<Record<number, number>>({});
	const [monedas, setMonedas] = useState(0);
	const [observacion, setObservacion] = useState("");

	const closed = session.estado === "cerrada";
	const conteo = closed
		? (session.cierre?.conteo ?? [])
		: DENOMINATIONS.map((denominacion) => ({ denominacion, cantidad: quantities[denominacion] ?? 0 }));
	const contado = closed ? (session.cierre?.contado ?? 0) : countedCash(conteo, monedas);
	const esperado = closed ? (session.cierre?.esperado ?? 0) : session.efectivoEsperado;
	const diferencia = contado - esperado;
	// Cierres antiguos pueden no traer el detalle de billetes.
	const showConteo = !closed || conteo.length > 0;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1.5 rounded-xl bg-muted p-4">
				{expectedCashBreakdown(session).map((row) => (
					<div key={row.label} className="flex justify-between text-sm">
						<span className="text-muted-foreground">{row.label}</span>
						<span className="tabular font-semibold">{formatMoney(row.value)}</span>
					</div>
				))}
				<div className="mt-1 flex justify-between border-t border-border pt-2 font-extrabold">
					<span>Efectivo esperado</span>
					<span className="tabular">{formatMoney(esperado)}</span>
				</div>
			</div>

			{showConteo && (
				<>
					<div className="flex justify-between text-[13px] font-bold text-muted-foreground">
						<span>Conteo de efectivo</span>
						<span>Cantidad · Subtotal</span>
					</div>
					<div className="flex flex-col gap-2">
						{conteo.map((line) => (
							<div key={line.denominacion} className="flex items-center gap-3">
								<span className="tabular w-20 font-bold">{formatMoney(line.denominacion)}</span>
								<Input
									inputMode="numeric"
									aria-label={`Cantidad de ${formatMoney(line.denominacion)}`}
									className="h-10 w-20 text-center font-bold"
									disabled={closed}
									value={line.cantidad || ""}
									placeholder="0"
									onChange={(e) =>
										setQuantities((q) => ({ ...q, [line.denominacion]: Number.parseInt(e.target.value, 10) || 0 }))
									}
								/>
								<span className="tabular flex-1 text-right text-muted-foreground">
									{formatMoney(line.denominacion * line.cantidad)}
								</span>
							</div>
						))}
						{!closed && (
							<div className="flex items-center gap-3">
								<span className="w-20 font-bold">Monedas</span>
								<MoneyInput value={monedas} onValueChange={setMonedas} className="h-10 flex-1" aria-label="Total en monedas" />
							</div>
						)}
					</div>
				</>
			)}

			<div className="grid grid-cols-2 gap-3">
				<div className="rounded-xl bg-muted p-3">
					<div className="text-[13px] font-semibold text-muted-foreground">Contado</div>
					<div className="tabular font-display text-xl font-extrabold">{formatMoney(contado)}</div>
				</div>
				<div
					className={cn(
						"rounded-xl p-3",
						diferencia < 0 ? "bg-[#FBE3DF] text-destructive" : diferencia > 0 ? "bg-tint-blue text-info" : "bg-tint-green text-success",
					)}
				>
					<div className="text-[13px] font-semibold">{differenceLabel(diferencia)}</div>
					<div className="tabular font-display text-xl font-extrabold">{formatSignedMoney(diferencia)}</div>
				</div>
			</div>

			{closed ? (
				session.cierre?.observacion && <p className="text-sm text-muted-foreground">Observación: {session.cierre.observacion}</p>
			) : (
				<>
					<Field label="Observación del cierre" htmlFor="obs">
						<Input
							id="obs"
							placeholder="Ej.: vuelto mal dado a un cliente"
							value={observacion}
							onChange={(e) => setObservacion(e.target.value)}
						/>
					</Field>
					<Button
						size="lg"
						variant="dark"
						disabled={close.isPending}
						onClick={() => close.mutate({ conteo, monedas, observacion })}
					>
						{close.isPending ? "Cerrando…" : "Cerrar caja"}
					</Button>
				</>
			)}
		</div>
	);
}
