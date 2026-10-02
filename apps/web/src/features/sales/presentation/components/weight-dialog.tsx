"use client";

import { useState } from "react";
import { NumericKeypad } from "@/core/components/numeric-keypad";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/core/ui/dialog";
import { SegmentedControl } from "@/core/ui/toggle-group";
import { formatMoney, formatNumber, formatQuantity, parseDecimal } from "@/core/utils/format";
import type { ProductEntity } from "@/features/products/domain/entities/product.entity";
import { ProductAvatar } from "@/features/products/presentation/components/product-avatar";
import {
	type CartLine,
	toProductQuantity,
	WEIGHT_SHORTCUTS,
	type WeightInputUnit,
} from "../../domain/entities/sale.entity";

const UNIT_OPTIONS = [
	{ value: "kg", label: "Kilos" },
	{ value: "lb", label: "Libras" },
] as const;

/**
 * Balanza: al elegir un producto solo se ingresa el peso o la cantidad,
 * el precio ya viene del producto. El padre lo monta con `key={product.id}`
 * para que el estado inicial se tome de nuevo con cada producto.
 */
export function WeightDialog({
	product,
	current,
	onClose,
	onConfirm,
}: {
	product: ProductEntity | null;
	current?: CartLine;
	onClose: () => void;
	onConfirm: (line: CartLine) => void;
}) {
	const [raw, setRaw] = useState(() => (current ? formatNumber(current.cantidad).replace(/\./g, "") : ""));
	const [inputUnit, setInputUnit] = useState<WeightInputUnit>(product?.unidad === "kg" ? "kg" : "und");
	const byWeight = product?.unidad === "kg";

	if (!product) return null;

	const cantidad = toProductQuantity(parseDecimal(raw), inputUnit);
	const total = Math.round(cantidad * product.precioVenta);
	const unitLabel = inputUnit === "und" ? product.unidad : inputUnit;

	const confirm = () => {
		if (cantidad <= 0) return;
		onConfirm({ product, cantidad });
		onClose();
	};

	return (
		<Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="gap-5 bg-[#FFEBD2] p-5 sm:max-w-md">
				<div className="flex items-center gap-3">
					<ProductAvatar color={product.color} className="size-14" />
					<div className="flex flex-col">
						<DialogTitle className="text-2xl">{product.nombre}</DialogTitle>
						<DialogDescription className="text-[15px] text-[#4A5443]">
							{formatMoney(product.precioVenta)} / {product.unidad} · Stock{" "}
							{formatQuantity(product.stock, product.unidad)}
						</DialogDescription>
					</div>
				</div>

				{byWeight && (
					<SegmentedControl
						aria-label="Unidad"
						value={inputUnit}
						onValueChange={(unit) => {
							setInputUnit(unit);
							setRaw("");
						}}
						options={UNIT_OPTIONS}
						className="w-full bg-white/60"
					/>
				)}

				<div className="flex flex-col items-center gap-1 rounded-2xl bg-card py-5">
					<span className="text-sm font-semibold text-muted-foreground">{byWeight ? "Peso" : "Cantidad"}</span>
					<span className="tabular font-display text-5xl font-extrabold">
						{raw || "0"} <span className="text-2xl text-muted-foreground">{unitLabel}</span>
					</span>
					<span className="tabular text-xl font-bold text-warning">= {formatMoney(total)}</span>
					{inputUnit === "lb" && cantidad > 0 && (
						<span className="text-xs text-muted-foreground">{formatQuantity(cantidad, "kg")}</span>
					)}
				</div>

				{byWeight && (
					<div className="grid grid-cols-4 gap-2">
						{WEIGHT_SHORTCUTS.map((shortcut) => (
							<Button
								key={shortcut.label}
								type="button"
								variant="outline"
								onClick={() => {
									setInputUnit(shortcut.unit);
									setRaw(formatNumber(shortcut.value));
								}}
							>
								{shortcut.label}
							</Button>
						))}
					</div>
				)}

				<NumericKeypad value={raw} onChange={setRaw} allowDecimal={byWeight} />

				<Button size="xl" variant="dark" disabled={cantidad <= 0} onClick={confirm}>
					{current ? "Actualizar" : "Agregar a la venta"} · {formatMoney(total)}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
