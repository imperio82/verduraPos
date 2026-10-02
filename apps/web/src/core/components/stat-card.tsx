import type * as React from "react";
import { cn } from "@/core/lib/utils";

export type StatTone = "white" | "green" | "blue" | "orange" | "yellow" | "dark";

const TONES: Record<StatTone, string> = {
	white: "bg-card border border-[#E7E0D0]",
	green: "bg-tint-green",
	blue: "bg-tint-blue",
	orange: "bg-tint-orange",
	yellow: "bg-tint-yellow",
	dark: "bg-brand-dark text-white",
};

/** Tarjeta de indicador (Ventas del día, Gastos, Dinero final...). */
export function StatCard({
	label,
	value,
	sub,
	tone = "white",
	valueClassName,
	className,
}: {
	label: React.ReactNode;
	value: React.ReactNode;
	sub?: React.ReactNode;
	tone?: StatTone;
	valueClassName?: string;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col gap-1.5 rounded-2xl p-4 md:p-5", TONES[tone], className)}>
			<span className={cn("text-sm font-semibold", tone === "dark" ? "text-white/75" : "text-[#4A5443]")}>{label}</span>
			<span className={cn("tabular font-display text-2xl font-extrabold md:text-[28px]", valueClassName)}>{value}</span>
			{sub && <span className={cn("text-[13px]", tone === "dark" ? "text-brand-yellow" : "text-muted-foreground")}>{sub}</span>}
		</div>
	);
}
