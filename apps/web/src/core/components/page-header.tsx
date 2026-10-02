import type * as React from "react";
import { cn } from "@/core/lib/utils";

export function PageHeader({
	title,
	children,
	className,
}: {
	title: React.ReactNode;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-wrap items-center gap-3 md:gap-5", className)}>
			<h1 className="font-display text-3xl font-extrabold md:text-[34px]">{title}</h1>
			{children}
		</div>
	);
}
