import type * as React from "react";
import { cn } from "@/core/lib/utils";
import { Label } from "@/core/ui/label";

/** Etiqueta + control + mensaje de error, apilados. */
export function Field({
	label,
	htmlFor,
	error,
	children,
	className,
}: {
	label: React.ReactNode;
	htmlFor?: string;
	error?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<Label htmlFor={htmlFor}>{label}</Label>
			{children}
			{error && <p className="text-sm font-semibold text-destructive">{error}</p>}
		</div>
	);
}
