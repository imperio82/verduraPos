"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Field } from "@/core/components/field";
import { MoneyInput } from "@/core/components/money-input";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { formatMoney } from "@/core/utils/format";
import {
	CATEGORY_META,
	PRODUCT_CATEGORIES,
	PRODUCT_UNITS,
	type ProductEntity,
	salePriceFromCost,
	UNIT_LABELS,
} from "../../domain/entities/product.entity";
import { useSaveProduct } from "../hooks/use-products";

const schema = z.object({
	nombre: z.string().trim().min(2, "Escribe el nombre"),
	categoria: z.enum(PRODUCT_CATEGORIES),
	unidad: z.enum(PRODUCT_UNITS),
	precioCompra: z.number().min(0),
	porcentajeGanancia: z.number().min(0).max(1000),
	stock: z.number().min(0),
	stockMinimo: z.number().min(0),
	color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
	nombre: "",
	categoria: "frutas",
	unidad: "kg",
	precioCompra: 0,
	porcentajeGanancia: 50,
	stock: 0,
	stockMinimo: 0,
	color: "#3E9B3E",
};

/** Crear / editar producto. El precio de venta se calcula con costo + % de ganancia. */
export function ProductFormDialog({
	product,
	open,
	onOpenChange,
}: {
	product?: ProductEntity | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const save = useSaveProduct();
	const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

	useEffect(() => {
		if (open) form.reset(product ? { ...EMPTY, ...product } : EMPTY);
	}, [open, product, form]);

	const [cost, pct] = useWatch({ control: form.control, name: ["precioCompra", "porcentajeGanancia"] });
	const number = (value: string) => Number.parseFloat(value.replace(",", ".")) || 0;

	const submit = form.handleSubmit((values) =>
		save.mutate(
			{ id: product?.id, data: { ...values, precioVenta: salePriceFromCost(values.precioCompra, values.porcentajeGanancia) } },
			{ onSuccess: () => onOpenChange(false) },
		),
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{product ? `Editar ${product.nombre}` : "Nuevo producto"}</DialogTitle>
				</DialogHeader>
				<form onSubmit={submit} className="grid grid-cols-2 gap-3">
					<Field label="Nombre" htmlFor="p-nombre" className="col-span-2" error={form.formState.errors.nombre?.message}>
						<Input id="p-nombre" {...form.register("nombre")} />
					</Field>
					<Field label="Categoría">
						<Controller
							control={form.control}
							name="categoria"
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{PRODUCT_CATEGORIES.map((c) => (
											<SelectItem key={c} value={c}>
												{CATEGORY_META[c].label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</Field>
					<Field label="Se vende por">
						<Controller
							control={form.control}
							name="unidad"
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{PRODUCT_UNITS.map((u) => (
											<SelectItem key={u} value={u}>
												{UNIT_LABELS[u]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</Field>
					<Field label="Precio de compra">
						<Controller
							control={form.control}
							name="precioCompra"
							render={({ field }) => <MoneyInput value={field.value} onValueChange={field.onChange} />}
						/>
					</Field>
					<Field label="% ganancia" htmlFor="p-pct">
						<Input id="p-pct" inputMode="numeric" {...form.register("porcentajeGanancia", { setValueAs: number })} />
					</Field>
					<div className="col-span-2 rounded-xl bg-tint-green p-3 text-[15px]">
						Precio de venta: <strong className="tabular">{formatMoney(salePriceFromCost(cost || 0, pct || 0))}</strong>
					</div>
					<Field label="Stock actual" htmlFor="p-stock">
						<Input id="p-stock" inputMode="decimal" {...form.register("stock", { setValueAs: number })} />
					</Field>
					<Field label="Avisar con menos de" htmlFor="p-min">
						<Input id="p-min" inputMode="decimal" {...form.register("stockMinimo", { setValueAs: number })} />
					</Field>
					<Field label="Color" htmlFor="p-color">
						<Input id="p-color" type="color" className="h-11 p-1" {...form.register("color")} />
					</Field>
					<DialogFooter className="col-span-2">
						<Button type="submit" variant="dark" disabled={save.isPending}>
							Guardar
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
