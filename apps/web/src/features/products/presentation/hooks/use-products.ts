"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { container } from "@/core/di/di-container";
import { AppError } from "@/core/errors/app-error";
import { queryKeys } from "@/core/api/query-keys";
import { TOKENS_PRODUCTS } from "../../di/tokens";
import type { CreateProductEntity, UpdateProductEntity } from "../../domain/entities/product.entity";
import type { CreateProductUseCase, GetProductsUseCase, UpdateProductUseCase } from "../../domain/usecases";

export function useProducts() {
	return useQuery({
		queryKey: queryKeys.products,
		queryFn: () => container.get<GetProductsUseCase>(TOKENS_PRODUCTS.GetProductsUseCase).execute(),
	});
}

export function useSaveProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id?: string; data: CreateProductEntity | UpdateProductEntity }) =>
			id
				? container.get<UpdateProductUseCase>(TOKENS_PRODUCTS.UpdateProductUseCase).execute(id, data)
				: container
						.get<CreateProductUseCase>(TOKENS_PRODUCTS.CreateProductUseCase)
						.execute(data as CreateProductEntity),
		onSuccess: (product, { id }) => {
			toast.success(id ? `${product.nombre} actualizado` : `${product.nombre} creado`);
			void queryClient.invalidateQueries({ queryKey: queryKeys.products });
		},
		onError: (error) => toast.error(AppError.fromError(error).message),
	});
}
