"use client";

import { SearchIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/core/lib/utils";

export function SearchInput({
	className,
	label = "Buscar",
	...props
}: React.ComponentProps<"input"> & { label?: string }) {
	return (
		<label
			className={cn(
				"flex h-[50px] min-w-0 items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-card px-4 focus-within:border-ring",
				className,
			)}
		>
			<SearchIcon className="size-5 shrink-0 text-muted-foreground" />
			<span className="sr-only">{label}</span>
			<input
				type="search"
				className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
				{...props}
			/>
		</label>
	);
}
