import { NotFoundError } from '@/core';
import type { ProductEntity } from '../entities/product.entity';
import type { ProductRepository } from '../repositories/product.repository';

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError('Producto no encontrado');
    return product;
  }
}
