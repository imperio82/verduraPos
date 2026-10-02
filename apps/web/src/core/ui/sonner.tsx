"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
	return (
		<Sonner
			position="top-center"
			richColors
			toastOptions={{ classNames: { toast: "!rounded-xl !font-sans !text-[15px]" } }}
			{...props}
		/>
	);
}

export { Toaster };
