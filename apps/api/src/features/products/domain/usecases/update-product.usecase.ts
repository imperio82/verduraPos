import { ConflictError, NotFoundError } from '@/core';
import type { ProductEntity, UpdateProductData } from '../entities/product.entity';
import type { ProductRepository } from '../repositories/product.repository';

export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string, data: UpdateProductData): Promise<ProductEntity> {
    if (data.nombre && (await this.productRepository.existsByName(data.nombre.trim(), id))) {
      throw new ConflictError(`Ya existe un producto llamado "${data.nombre}"`, 'nombre');
    }

    const updated = await this.productRepository.update(id, data);
    if (!updated) throw new NotFoundError('Producto no encontrado');
    return updated;
  }
}
