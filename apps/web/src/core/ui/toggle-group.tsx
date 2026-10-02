"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/core/lib/utils";

/**
 * Control segmentado (Hoy / Semana / Mes, Por producto / Venta total...).
 * Siempre de selección única: el valor vacío se ignora para no quedar sin opción.
 */
function SegmentedControl<T extends string>({
	value,
	onValueChange,
	options,
	className,
	size = "default",
	"aria-label": ariaLabel,
}: {
	value: T;
	onValueChange: (value: T) => void;
	options: readonly { value: T; label: React.ReactNode }[];
	className?: string;
	size?: "default" | "sm";
	"aria-label"?: string;
}) {
	return (
		<ToggleGroupPrimitive.Root
			type="single"
			value={value}
			onValueChange={(next) => next && onValueChange(next as T)}
			aria-label={ariaLabel}
			className={cn("inline-flex rounded-xl bg-secondary p-1", className)}
		>
			{options.map((option) => (
				<ToggleGroupPrimitive.Item
					key={option.value}
					value={option.value}
					className={cn(
						"flex-1 rounded-[10px] px-4 font-semibold whitespace-nowrap text-[#4A5443] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=on]:bg-card data-[state=on]:font-bold data-[state=on]:text-foreground data-[state=on]:shadow-sm",
						size === "default" ? "h-10 text-[15px]" : "h-8 px-3 text-sm",
					)}
				>
					{option.label}
				</ToggleGroupPrimitive.Item>
			))}
		</ToggleGroupPrimitive.Root>
	);
}

export { SegmentedControl };
