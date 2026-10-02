import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/core/lib/utils";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				dark: "bg-brand-dark text-white hover:bg-brand-dark/90",
				destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
				outline: "border-[1.5px] border-border bg-card hover:bg-muted",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-muted",
				link: "text-ring underline-offset-4 hover:underline",
			},
			size: {
				default: "h-11 px-4 py-2 text-[15px] has-[>svg]:px-3",
				sm: "h-9 gap-1.5 px-3 text-sm has-[>svg]:px-2.5",
				lg: "h-14 rounded-xl px-6 text-base has-[>svg]:px-4",
				xl: "h-16 rounded-2xl px-6 text-lg font-extrabold",
				icon: "size-11",
				"icon-sm": "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
