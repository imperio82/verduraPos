import type { ProductEntity, ProductFilters } from '../entities/product.entity';
import type { ProductRepository } from '../repositories/product.repository';

export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(filters: ProductFilters = {}): Promise<ProductEntity[]> {
    return this.productRepository.findAll({ soloActivos: true, ...filters });
  }
}
