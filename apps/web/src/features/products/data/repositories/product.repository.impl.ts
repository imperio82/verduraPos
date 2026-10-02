import type { CreateProductEntity, ProductEntity, UpdateProductEntity } from "../../domain/entities/product.entity";
import type { ProductRepository } from "../../domain/repositories/product.repository";
import type { ProductDatasource } from "../datasource/product.datasource";

export class ProductRepositoryImpl implements ProductRepository {
	constructor(private readonly productDatasource: ProductDatasource) {}

	getProducts(): Promise<ProductEntity[]> {
		return this.productDatasource.getProducts();
	}

	createProduct(product: CreateProductEntity): Promise<ProductEntity> {
		return this.productDatasource.createProduct(product);
	}

	updateProduct(id: string, product: UpdateProductEntity): Promise<ProductEntity> {
		return this.productDatasource.updateProduct(id, product);
	}
}
