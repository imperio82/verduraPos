"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/api/query-keys";
import { container } from "@/core/di/di-container";
import type { DateRangeParams } from "@/core/utils/period";
import { TOKENS_ACCOUNTING } from "../../di/tokens";
import type { GetAccountingSummaryUseCase } from "../../domain/usecases";

export function useAccountingSummary(range: DateRangeParams) {
	return useQuery({
		queryKey: queryKeys.accounting(range),
		queryFn: () =>
			container.get<GetAccountingSummaryUseCase>(TOKENS_ACCOUNTING.GetAccountingSummaryUseCase).execute(range),
		placeholderData: keepPreviousData,
	});
}
