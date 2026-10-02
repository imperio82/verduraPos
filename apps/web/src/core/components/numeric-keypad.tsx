"use client";

import { DeleteIcon } from "lucide-react";
import { cn } from "@/core/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"] as const;

/**
 * Teclado numérico grande (balanza, venta total, conteo de billetes).
 * Trabaja con el texto crudo ("1,25") para no perder la coma mientras se escribe.
 */
export function NumericKeypad({
	value,
	onChange,
	allowDecimal = true,
	maxDecimals = 3,
	className,
}: {
	value: string;
	onChange: (value: string) => void;
	allowDecimal?: boolean;
	maxDecimals?: number;
	className?: string;
}) {
	const press = (key: (typeof KEYS)[number]) => {
		if (key === "⌫") return onChange(value.slice(0, -1));
		if (key === ",") {
			if (!allowDecimal || value.includes(",")) return;
			return onChange(value ? `${value},` : "0,");
		}
		const decimals = value.split(",")[1];
		if (decimals !== undefined && decimals.length >= maxDecimals) return;
		onChange(value === "0" ? key : value + key);
	};

	return (
		<div className={cn("grid grid-cols-3 gap-2", className)}>
			{KEYS.map((key) => (
				<button
					key={key}
					type="button"
					disabled={key === "," && !allowDecimal}
					onClick={() => press(key)}
					aria-label={key === "⌫" ? "Borrar" : key}
					className="flex h-14 items-center justify-center rounded-xl bg-card text-2xl font-bold shadow-[0_1px_0_#E4DCC8] transition-colors active:bg-secondary disabled:opacity-30"
				>
					{key === "⌫" ? <DeleteIcon className="size-6" /> : key}
				</button>
			))}
		</div>
	);
}
