"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MONEY_KEYS, queryKeys } from "@/core/api/query-keys";
import { container } from "@/core/di/di-container";
import { AppError } from "@/core/errors/app-error";
import { useInvalidate } from "@/core/hooks/use-invalidate";
import { TOKENS_CASH_REGISTERS as T } from "../../di/tokens";
import type { CloseCashSessionEntity, OpenCashSessionEntity } from "../../domain/entities/cash-register.entity";
import type { CashSessionsQuery } from "../../domain/repositories/cash-register.repository";
import type {
	AddCashIncomeUseCase,
	CloseCashSessionUseCase,
	CreateCashRegisterUseCase,
	GetCashRegistersUseCase,
	GetCashSessionDetailUseCase,
	GetCashSessionsUseCase,
	OpenCashSessionUseCase,
} from "../../domain/usecases";

const onError = (error: unknown) => toast.error(AppError.fromError(error).message);

export function useCashRegisters() {
	return useQuery({
		queryKey: queryKeys.cashRegisters,
		queryFn: () => container.get<GetCashRegistersUseCase>(T.GetCashRegistersUseCase).execute(),
	});
}

export function useCashSessions(query: CashSessionsQuery = {}) {
	return useQuery({
		queryKey: queryKeys.cashSessions(query),
		queryFn: () => container.get<GetCashSessionsUseCase>(T.GetCashSessionsUseCase).execute(query),
	});
}

/** Sesiones abiertas: las cajas donde se puede vender ahora mismo. */
export function useOpenCashSessions() {
	return useCashSessions({ estado: "abierta" });
}

export function useCashSessionDetail(id: string) {
	return useQuery({
		queryKey: queryKeys.cashSession(id),
		queryFn: () => container.get<GetCashSessionDetailUseCase>(T.GetCashSessionDetailUseCase).execute(id),
		enabled: Boolean(id),
	});
}

export function useCreateCashRegister() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: (nombre: string) => container.get<CreateCashRegisterUseCase>(T.CreateCashRegisterUseCase).execute(nombre),
		onSuccess: (register) => {
			toast.success(`${register.nombre} creada`);
			void invalidate([queryKeys.cashRegisters]);
		},
		onError,
	});
}

export function useOpenCashSession() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: (data: OpenCashSessionEntity) =>
			container.get<OpenCashSessionUseCase>(T.OpenCashSessionUseCase).execute(data),
		onSuccess: (session) => {
			toast.success(`${session.cajaNombre} abierta`);
			void invalidate(MONEY_KEYS);
		},
		onError,
	});
}

export function useAddCashIncome(sessionId: string) {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: ({ concepto, monto }: { concepto: string; monto: number }) =>
			container.get<AddCashIncomeUseCase>(T.AddCashIncomeUseCase).execute(sessionId, concepto, monto),
		onSuccess: () => {
			toast.success("Ingreso registrado");
			void invalidate(MONEY_KEYS);
		},
		onError,
	});
}

export function useCloseCashSession(sessionId: string) {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: (data: CloseCashSessionEntity) =>
			container.get<CloseCashSessionUseCase>(T.CloseCashSessionUseCase).execute(sessionId, data),
		onSuccess: (session) => {
			toast.success(`${session.cajaNombre} cerrada`);
			void invalidate(MONEY_KEYS);
		},
		onError,
	});
}
