"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/api/query-keys";
import { container } from "@/core/di/di-container";
import { TOKENS_SALES } from "../../di/tokens";
import type { GetDailySalesUseCase, GetSessionSalesUseCase } from "../../domain/usecases";

/** Ventas de un día (YYYY-MM-DD). */
export function useDailySales(day: string) {
	return useQuery({
		queryKey: queryKeys.dailySales(day),
		queryFn: () => container.get<GetDailySalesUseCase>(TOKENS_SALES.GetDailySalesUseCase).execute(day),
	});
}

/** Ventas de una caja (turno). */
export function useSessionSales(cashSessionId: string) {
	return useQuery({
		queryKey: queryKeys.sessionSales(cashSessionId),
		queryFn: () => container.get<GetSessionSalesUseCase>(TOKENS_SALES.GetSessionSalesUseCase).execute(cashSessionId),
		enabled: Boolean(cashSessionId),
	});
}
