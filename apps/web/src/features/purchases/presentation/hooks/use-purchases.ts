"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/core/api/query-keys";
import { container } from "@/core/di/di-container";
import { AppError } from "@/core/errors/app-error";
import { useInvalidate } from "@/core/hooks/use-invalidate";
import { formatMoney } from "@/core/utils/format";
import { TOKENS_PURCHASES as T } from "../../di/tokens";
import type { PurchaseFilters, ReceivePurchaseEntity } from "../../domain/entities/purchase.entity";
import type {
	CancelPurchaseUseCase,
	CreatePurchaseUseCase,
	GetLastPurchaseUseCase,
	GetPurchasesUseCase,
	GetPurchaseUseCase,
	ReceivePurchaseUseCase,
	SavePurchaseInput,
} from "../../domain/usecases";

const onError = (error: unknown) => toast.error(AppError.fromError(error).message);

export function usePurchases(filters: PurchaseFilters) {
	return useQuery({
		queryKey: queryKeys.purchases(filters),
		queryFn: () => container.get<GetPurchasesUseCase>(T.GetPurchasesUseCase).execute(filters),
	});
}

export function usePurchase(id: string) {
	return useQuery({
		queryKey: queryKeys.purchase(id),
		queryFn: () => container.get<GetPurchaseUseCase>(T.GetPurchaseUseCase).execute(id),
	});
}

export function useLastPurchase(supplierId: string | undefined) {
	return useQuery({
		queryKey: queryKeys.lastPurchase(supplierId ?? ""),
		queryFn: () => container.get<GetLastPurchaseUseCase>(T.GetLastPurchaseUseCase).execute(supplierId ?? ""),
		enabled: Boolean(supplierId),
	});
}

export function useCreatePurchase() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: (input: SavePurchaseInput) => container.get<CreatePurchaseUseCase>(T.CreatePurchaseUseCase).execute(input),
		onSuccess: (purchase) => {
			toast.success(`Compra ${purchase.codigo} guardada · ${formatMoney(purchase.total)} por llegar`);
			void invalidate([queryKeys.purchasesAll]);
		},
		onError,
	});
}

export function useReceivePurchase(id: string) {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: (data: ReceivePurchaseEntity) =>
			container.get<ReceivePurchaseUseCase>(T.ReceivePurchaseUseCase).execute(id, data),
		onSuccess: (purchase) => {
			toast.success(`Compra ${purchase.codigo} recibida y sumada al stock`);
			void invalidate([queryKeys.purchasesAll, queryKeys.products]);
		},
		onError,
	});
}

export function useCancelPurchase(id: string) {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: () => container.get<CancelPurchaseUseCase>(T.CancelPurchaseUseCase).execute(id),
		onSuccess: (purchase) => {
			toast.success(`Compra ${purchase.codigo} cancelada`);
			void invalidate([queryKeys.purchasesAll]);
		},
		onError,
	});
}
