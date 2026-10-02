"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MONEY_KEYS, queryKeys } from "@/core/api/query-keys";
import { container } from "@/core/di/di-container";
import { AppError } from "@/core/errors/app-error";
import { useInvalidate } from "@/core/hooks/use-invalidate";
import { formatMoney } from "@/core/utils/format";
import { TOKENS_SALES } from "../../di/tokens";
import type { CheckoutInput, CheckoutSaleUseCase, GetNextSaleNumberUseCase } from "../../domain/usecases";
import { useCartStore } from "../store/cart.store";

export function useNextSaleNumber() {
	return useQuery({
		queryKey: queryKeys.nextSaleNumber,
		queryFn: () => container.get<GetNextSaleNumberUseCase>(TOKENS_SALES.GetNextSaleNumberUseCase).execute(),
	});
}

export function useCheckout() {
	const invalidate = useInvalidate();
	const reset = useCartStore((state) => state.reset);

	return useMutation({
		mutationFn: (input: CheckoutInput) =>
			container.get<CheckoutSaleUseCase>(TOKENS_SALES.CheckoutSaleUseCase).execute(input),
		onSuccess: (sale) => {
			toast.success(`Venta #${String(sale.numero).padStart(4, "0")} cobrada · ${formatMoney(sale.total)}`);
			reset();
			void invalidate([...MONEY_KEYS, queryKeys.products, queryKeys.nextSaleNumber]);
		},
		onError: (error) => toast.error(AppError.fromError(error).message),
	});
}
