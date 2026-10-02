"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { MONEY_KEYS } from "@/core/api/query-keys";
import { container } from "@/core/di/di-container";
import { AppError } from "@/core/errors/app-error";
import { useInvalidate } from "@/core/hooks/use-invalidate";
import { formatMoney } from "@/core/utils/format";
import { TOKENS_EXPENSES } from "../../di/tokens";
import type { CreateExpenseEntity } from "../../domain/entities/expense.entity";
import type { RegisterExpenseUseCase } from "../../domain/usecases";

export function useRegisterExpense() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: (data: CreateExpenseEntity) =>
			container.get<RegisterExpenseUseCase>(TOKENS_EXPENSES.RegisterExpenseUseCase).execute(data),
		onSuccess: (expense) => {
			toast.success(`Gasto registrado · ${formatMoney(expense.monto)}`);
			void invalidate(MONEY_KEYS);
		},
		onError: (error) => toast.error(AppError.fromError(error).message),
	});
}
