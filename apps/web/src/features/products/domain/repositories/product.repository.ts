import type { CreateProductEntity, ProductEntity, UpdateProductEntity } from "../entities/product.entity";

export interface ProductRepository {
	getProducts(): Promise<ProductEntity[]>;
	createProduct(product: CreateProductEntity): Promise<ProductEntity>;
	updateProduct(id: string, product: UpdateProductEntity): Promise<ProductEntity>;
}
