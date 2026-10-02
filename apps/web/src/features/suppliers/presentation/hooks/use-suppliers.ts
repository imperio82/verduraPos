"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { container } from "@/core/di/di-container";
import { AppError } from "@/core/errors/app-error";
import { queryKeys } from "@/core/api/query-keys";
import { TOKENS_SUPPLIERS } from "../../di/tokens";
import type { CreateSupplierEntity } from "../../domain/entities/supplier.entity";
import type { CreateSupplierUseCase, GetSuppliersUseCase } from "../../domain/usecases";

export function useSuppliers() {
	return useQuery({
		queryKey: queryKeys.suppliers,
		queryFn: () => container.get<GetSuppliersUseCase>(TOKENS_SUPPLIERS.GetSuppliersUseCase).execute(),
	});
}

export function useCreateSupplier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateSupplierEntity) =>
			container.get<CreateSupplierUseCase>(TOKENS_SUPPLIERS.CreateSupplierUseCase).execute(data),
		onSuccess: (supplier) => {
			toast.success(`Proveedor ${supplier.nombre} creado`);
			void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
		},
		onError: (error) => toast.error(AppError.fromError(error).message),
	});
}
