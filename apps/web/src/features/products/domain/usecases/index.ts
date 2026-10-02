import type { CreateProductEntity, ProductEntity, UpdateProductEntity } from "../entities/product.entity";
import type { ProductRepository } from "../repositories/product.repository";

export class GetProductsUseCase {
	constructor(private readonly productRepository: ProductRepository) {}

	execute(): Promise<ProductEntity[]> {
		return this.productRepository.getProducts();
	}
}

export class CreateProductUseCase {
	constructor(private readonly productRepository: ProductRepository) {}

	execute(product: CreateProductEntity): Promise<ProductEntity> {
		return this.productRepository.createProduct({ ...product, nombre: product.nombre.trim() });
	}
}

export class UpdateProductUseCase {
	constructor(private readonly productRepository: ProductRepository) {}

	execute(id: string, product: UpdateProductEntity): Promise<ProductEntity> {
		return this.productRepository.updateProduct(id, product);
	}
}
