import { container } from "@/core/di/di-container";
import { ProductDatasource } from "../data/datasource/product.datasource";
import { ProductRepositoryImpl } from "../data/repositories/product.repository.impl";
import { CreateProductUseCase, GetProductsUseCase, UpdateProductUseCase } from "../domain/usecases";
import { TOKENS_PRODUCTS as T } from "./tokens";

export function productsConfigureContainer(): void {
	// Datasource
	container.registerClass(T.ProductDatasource, ProductDatasource);
	// Repository
	container.registerClass(T.ProductRepository, ProductRepositoryImpl, [T.ProductDatasource]);
	// Use cases
	container.registerClass(T.GetProductsUseCase, GetProductsUseCase, [T.ProductRepository]);
	container.registerClass(T.CreateProductUseCase, CreateProductUseCase, [T.ProductRepository]);
	container.registerClass(T.UpdateProductUseCase, UpdateProductUseCase, [T.ProductRepository]);
}
