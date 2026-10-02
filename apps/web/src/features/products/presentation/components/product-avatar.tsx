import { cn } from "@/core/lib/utils";

/** Círculo de color que representa al producto (como en el diseño). */
export function ProductAvatar({ color, className }: { color: string; className?: string }) {
	return (
		<span
			aria-hidden
			className={cn("inline-block size-10 shrink-0 rounded-full shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.12)]", className)}
			style={{ backgroundColor: color }}
		/>
	);
}
