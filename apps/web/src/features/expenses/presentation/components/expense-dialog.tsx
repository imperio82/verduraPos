"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Field } from "@/core/components/field";
import { MoneyInput } from "@/core/components/money-input";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { NoOpenSessionNotice } from "@/features/cash-registers/presentation/components/no-open-session-notice";
import { useActiveSession } from "@/features/cash-registers/presentation/hooks/use-active-session";
import {
	EXPENSE_CATEGORIES,
	EXPENSE_CATEGORY_META,
	EXPENSE_PAYMENT_LABELS,
	EXPENSE_PAYMENT_METHODS,
} from "../../domain/entities/expense.entity";
import { useRegisterExpense } from "../hooks/use-register-expense";

const schema = z.object({
	concepto: z.string().trim().min(2, "Escribe en qué se gastó"),
	destino: z.enum(EXPENSE_CATEGORIES),
	monto: z.number().positive("El monto debe ser mayor a cero"),
	metodoPago: z.enum(EXPENSE_PAYMENT_METHODS),
	cashSessionId: z.string().min(1, "Abre una caja para registrar el gasto"),
});
type FormValues = z.infer<typeof schema>;

const emptyValues = (cashSessionId: string): FormValues => ({
	concepto: "",
	destino: "proveedor",
	monto: 0,
	metodoPago: "efectivo",
	cashSessionId,
});

/**
 * Registrar gasto o pago. Todo gasto queda en la caja del turno para que salga
 * en su cierre; solo el pagado en efectivo descuenta del dinero esperado.
 */
export function ExpenseDialog({
	open,
	onOpenChange,
	fixedSessionId,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Desde el detalle de una caja: el gasto siempre sale de esa caja. */
	fixedSessionId?: string;
}) {
	const { openSessions, session } = useActiveSession();
	const register = useRegisterExpense();

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: emptyValues(""),
	});

	useEffect(() => {
		if (open) form.reset(emptyValues(fixedSessionId ?? session?.id ?? ""));
	}, [open, fixedSessionId, session?.id, form]);

	const noOpenSession = !fixedSessionId && openSessions.length === 0;
	const submit = form.handleSubmit((values) => register.mutate(values, { onSuccess: () => onOpenChange(false) }));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Registrar gasto</DialogTitle>
					<DialogDescription>Compras, fletes, insumos, servicios y demás pagos.</DialogDescription>
				</DialogHeader>
				<form onSubmit={submit} className="flex flex-col gap-4">
					<Field label="Concepto" htmlFor="concepto" error={form.formState.errors.concepto?.message}>
						<Input id="concepto" placeholder="Ej.: Flete desde la central" {...form.register("concepto")} />
					</Field>
					<div className="grid grid-cols-2 gap-3">
						<Field label="Destino">
							<Controller
								control={form.control}
								name="destino"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{EXPENSE_CATEGORIES.map((c) => (
												<SelectItem key={c} value={c}>
													{EXPENSE_CATEGORY_META[c].label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</Field>
						<Field label="Monto" error={form.formState.errors.monto?.message}>
							<Controller
								control={form.control}
								name="monto"
								render={({ field }) => <MoneyInput value={field.value} onValueChange={field.onChange} />}
							/>
						</Field>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<Field label="Forma de pago">
							<Controller
								control={form.control}
								name="metodoPago"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{EXPENSE_PAYMENT_METHODS.map((m) => (
												<SelectItem key={m} value={m}>
													{EXPENSE_PAYMENT_LABELS[m]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</Field>
						{!fixedSessionId && (
							<Field label="Caja" error={form.formState.errors.cashSessionId?.message}>
								<Controller
									control={form.control}
									name="cashSessionId"
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange} disabled={noOpenSession}>
											<SelectTrigger>
												<SelectValue placeholder="Sin cajas abiertas" />
											</SelectTrigger>
											<SelectContent>
												{openSessions.map((s) => (
													<SelectItem key={s.id} value={s.id}>
														{s.cajaNombre} ({s.cajero})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
							</Field>
						)}
					</div>
					{noOpenSession && <NoOpenSessionNotice what="gastos del día" />}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancelar
						</Button>
						<Button type="submit" variant="dark" disabled={noOpenSession || register.isPending}>
							{register.isPending ? "Guardando…" : "Registrar gasto"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
