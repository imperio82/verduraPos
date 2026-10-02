"use client";

import type * as React from "react";
import { Input } from "@/core/ui/input";
import { parseMoney } from "@/core/utils/format";

const format = (value: number) => (value ? `$${new Intl.NumberFormat("es-CO").format(value)}` : "");

/** Input de pesos: muestra "$200.000" y entrega el número 200000. */
export function MoneyInput({
	value,
	onValueChange,
	...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
	value: number;
	onValueChange: (value: number) => void;
}) {
	return (
		<Input
			inputMode="numeric"
			placeholder="$0"
			value={format(value)}
			onChange={(event) => onValueChange(parseMoney(event.target.value))}
			className="tabular text-lg font-bold"
			{...props}
		/>
	);
}
