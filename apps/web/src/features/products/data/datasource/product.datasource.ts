import APIClient, { resolveUrl } from "@/core/api/api-client";
import type { CreateProductEntity, ProductEntity, UpdateProductEntity } from "../../domain/entities/product.entity";

export const urlsProducts = {
	getProducts: "/products",
	createProduct: "/products",
	updateProduct: "/products/:id",
} as const;

export class ProductDatasource {
	getProducts(): Promise<ProductEntity[]> {
		return APIClient.get<ProductEntity[]>({ url: urlsProducts.getProducts });
	}

	createProduct(product: CreateProductEntity): Promise<ProductEntity> {
		return APIClient.post<ProductEntity>({ url: urlsProducts.createProduct, data: product });
	}

	updateProduct(id: string, product: UpdateProductEntity): Promise<ProductEntity> {
		return APIClient.patch<ProductEntity>({ url: resolveUrl(urlsProducts.updateProduct, { id }), data: product });
	}
}
