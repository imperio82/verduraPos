"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/api/query-keys";
import { container } from "@/core/di/di-container";
import { TOKENS_EXPENSES } from "../../di/tokens";
import type { GetDailyExpensesUseCase } from "../../domain/usecases";

/** Gastos (egresos) de un día (YYYY-MM-DD). */
export function useDailyExpenses(day: string) {
	return useQuery({
		queryKey: queryKeys.dailyExpenses(day),
		queryFn: () => container.get<GetDailyExpensesUseCase>(TOKENS_EXPENSES.GetDailyExpensesUseCase).execute(day),
	});
}
