import type * as React from "react";
import { cn } from "@/core/lib/utils";

export function EmptyState({
	icon,
	title,
	children,
	className,
}: {
	icon?: React.ReactNode;
	title: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center", className)}>
			{icon && <div className="text-muted-foreground [&_svg]:size-10">{icon}</div>}
			<p className="font-display text-lg font-bold">{title}</p>
			{children && <div className="text-sm text-muted-foreground">{children}</div>}
		</div>
	);
}
