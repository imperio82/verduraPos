"use client";

import type * as React from "react";

import { ShoppingBasketIcon, XIcon } from "lucide-react";
import { EmptyState } from "@/core/components/empty-state";
import { NumericKeypad } from "@/core/components/numeric-keypad";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/ui/button";
import { formatMoney, formatQuantity, parseMoney } from "@/core/utils/format";
import {
	type PaymentMethod,
	PAYMENT_METHOD_LABELS,
} from "@/features/cash-registers/domain/entities/cash-register.entity";
import { ProductAvatar } from "@/features/products/presentation/components/product-avatar";
import { type CartLine, cartSubtotal, lineTotal } from "../../domain/entities/sale.entity";
import { useCartStore } from "../store/cart.store";

const METHODS = Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][];

/** Panel derecho del POS: venta actual, método de pago y cobro. */
export function CartPanel({
	header,
	onEditLine,
	onCheckout,
	isCharging,
	disabled,
}: {
	header: React.ReactNode;
	onEditLine: (line: CartLine) => void;
	onCheckout: () => void;
	isCharging: boolean;
	disabled?: boolean;
}) {
	const { mode, lines, remove, metodoPago, setMetodoPago, totalAmount, setTotalAmount } = useCartStore();
	const total = mode === "productos" ? cartSubtotal(lines) : totalAmount;

	return (
		<div className="flex h-full min-h-0 flex-col gap-4">
			{header}

			{mode === "productos" ? (
				<div className="-mr-2 flex min-h-0 flex-1 flex-col overflow-y-auto pr-2">
					{lines.length === 0 ? (
						<EmptyState icon={<ShoppingBasketIcon />} title="Venta vacía" className="my-auto">
							Toca un producto para agregarlo.
						</EmptyState>
					) : (
						lines.map((line) => (
							<div key={line.product.id} className="flex items-center gap-3 border-b border-dashed border-border py-3">
								<button
									type="button"
									onClick={() => onEditLine(line)}
									className="flex min-w-0 flex-1 items-center gap-3 text-left"
								>
									<ProductAvatar color={line.product.color} />
									<span className="min-w-0 flex-1">
										<span className="block truncate font-bold">{line.product.nombre}</span>
										<span className="tabular block text-sm text-muted-foreground">
											{formatQuantity(line.cantidad, line.product.unidad)} × {formatMoney(line.product.precioVenta)}
										</span>
									</span>
									<span className="tabular text-[17px] font-extrabold">{formatMoney(lineTotal(line))}</span>
								</button>
								<Button
									variant="ghost"
									size="icon"
									className="bg-muted text-muted-foreground"
									aria-label={`Quitar ${line.product.nombre}`}
									onClick={() => remove(line.product.id)}
								>
									<XIcon />
								</Button>
							</div>
						))
					)}
				</div>
			) : (
				<div className="flex flex-1 flex-col justify-end gap-3">
					<div className="rounded-2xl bg-muted p-4 text-center">
						<span className="text-sm font-semibold text-muted-foreground">Valor total de la venta</span>
						<div className="tabular font-display text-4xl font-extrabold">{formatMoney(totalAmount)}</div>
					</div>
					<NumericKeypad
						value={totalAmount ? String(totalAmount) : ""}
						onChange={(raw) => setTotalAmount(parseMoney(raw))}
						allowDecimal={false}
					/>
				</div>
			)}

			<div className="flex flex-col gap-2 pt-1">
				{mode === "productos" && (
					<div className="flex justify-between text-[15px] text-muted-foreground">
						<span>Subtotal</span>
						<span className="tabular">{formatMoney(total)}</span>
					</div>
				)}
				<div className="flex items-baseline justify-between">
					<span className="font-display text-xl font-extrabold">Total</span>
					<span className="tabular font-display text-3xl font-extrabold">{formatMoney(total)}</span>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-2" role="group" aria-label="Método de pago">
				{METHODS.map(([value, label]) => (
					<button
						key={value}
						type="button"
						aria-pressed={metodoPago === value}
						onClick={() => setMetodoPago(value)}
						className={cn(
							"h-12 rounded-xl border-[1.5px] text-[15px] font-bold transition-colors",
							metodoPago === value ? "border-brand-dark bg-brand-dark text-white" : "border-border bg-card",
						)}
					>
						{label}
					</button>
				))}
			</div>

			<Button size="xl" disabled={disabled || isCharging || total <= 0} onClick={onCheckout}>
				{isCharging ? "Cobrando…" : `Cobrar ${formatMoney(total)}`}
			</Button>
		</div>
	);
}
