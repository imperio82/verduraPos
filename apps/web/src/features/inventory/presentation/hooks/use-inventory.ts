"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/core/api/query-keys";
import { container } from "@/core/di/di-container";
import { AppError } from "@/core/errors/app-error";
import { useInvalidate } from "@/core/hooks/use-invalidate";
import { formatMoney } from "@/core/utils/format";
import { TOKENS_INVENTORY as T } from "../../di/tokens";
import type { RegisterDamageEntity, RegisterRecountEntity } from "../../domain/entities/inventory.entity";
import type {
	GetDamageSummaryUseCase,
	GetLastRecountUseCase,
	RegisterDamageUseCase,
	RegisterRecountUseCase,
} from "../../domain/usecases";

const onError = (error: unknown) => toast.error(AppError.fromError(error).message);

export function useLastRecount() {
	return useQuery({
		queryKey: queryKeys.lastRecount,
		queryFn: () => container.get<GetLastRecountUseCase>(T.GetLastRecountUseCase).execute(),
	});
}

export function useDamageSummary() {
	return useQuery({
		queryKey: queryKeys.damages,
		queryFn: () => container.get<GetDamageSummaryUseCase>(T.GetDamageSummaryUseCase).execute(),
	});
}

export function useRegisterRecount() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: (data: RegisterRecountEntity) =>
			container.get<RegisterRecountUseCase>(T.RegisterRecountUseCase).execute(data),
		onSuccess: (recount) => {
			toast.success(`Reconteo guardado · ${recount.items.length} productos ajustados`);
			void invalidate([queryKeys.lastRecount, queryKeys.products, queryKeys.cashSessionAll]);
		},
		onError,
	});
}

export function useRegisterDamage() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: (data: RegisterDamageEntity) => container.get<RegisterDamageUseCase>(T.RegisterDamageUseCase).execute(data),
		onSuccess: (damage) => {
			toast.success(`${damage.nombre} dañado registrado · ${formatMoney(damage.costo)} de pérdida`);
			void invalidate([queryKeys.damages, queryKeys.products, queryKeys.cashSessionsAll, queryKeys.cashSessionAll]);
		},
		onError,
	});
}
