"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MONEY_KEYS, queryKeys } from "@/core/api/query-keys";
import { container } from "@/core/di/di-container";
import { AppError } from "@/core/errors/app-error";
import { useInvalidate } from "@/core/hooks/use-invalidate";
import { formatMoney } from "@/core/utils/format";
import { TOKENS_SAVINGS as T } from "../../di/tokens";
import type {
	AddSavingsDepositEntity,
	SaveSavingsGoalEntity,
	UpdateSavingsGoalEntity,
} from "../../domain/entities/savings.entity";
import type {
	AddSavingsDepositUseCase,
	GetSavingsGoalsUseCase,
	SaveSavingsGoalUseCase,
	UpdateSavingsGoalUseCase,
} from "../../domain/usecases";

const onError = (error: unknown) => toast.error(AppError.fromError(error).message);

export function useSavingsGoals() {
	return useQuery({
		queryKey: queryKeys.savingsGoals,
		queryFn: () => container.get<GetSavingsGoalsUseCase>(T.GetSavingsGoalsUseCase).execute(),
	});
}

/** Crear (sin id) o editar (con id) una meta. */
export function useSaveSavingsGoal() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: (goal: SaveSavingsGoalEntity & { id?: string }) =>
			container.get<SaveSavingsGoalUseCase>(T.SaveSavingsGoalUseCase).execute(goal),
		onSuccess: (goal, input) => {
			toast.success(input.id ? `Meta "${goal.nombre}" actualizada` : `Meta "${goal.nombre}" creada`);
			void invalidate([queryKeys.savingsGoals, queryKeys.accountingAll]);
		},
		onError,
	});
}

/** Cambios puntuales, como archivar o reactivar una meta. */
export function useUpdateSavingsGoal() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: ({ id, ...changes }: UpdateSavingsGoalEntity & { id: string }) =>
			container.get<UpdateSavingsGoalUseCase>(T.UpdateSavingsGoalUseCase).execute(id, changes),
		onSuccess: (goal) => {
			toast.success(goal.activa ? `Meta "${goal.nombre}" activa` : `Meta "${goal.nombre}" archivada`);
			void invalidate([queryKeys.savingsGoals, queryKeys.accountingAll]);
		},
		onError,
	});
}

export function useAddSavingsDeposit() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: (data: AddSavingsDepositEntity) =>
			container.get<AddSavingsDepositUseCase>(T.AddSavingsDepositUseCase).execute(data),
		onSuccess: (deposit) => {
			toast.success(`${formatMoney(deposit.monto)} enviados a "${deposit.goalNombre}"`);
			void invalidate([queryKeys.savingsGoals, ...MONEY_KEYS]);
		},
		onError,
	});
}
