"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { configureContainer } from "@/core/di/container.config";
import { Toaster } from "@/core/ui/sonner";

// El contenedor se configura al cargar el módulo, antes del primer render.
configureContainer();

export function AppProviders({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: { staleTime: 15_000, refetchOnWindowFocus: true, retry: 1 },
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<Toaster />
		</QueryClientProvider>
	);
}
