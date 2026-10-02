import { ConflictError, salePriceFromCost } from '@/core';
import type { CreateProductData, ProductEntity } from '../entities/product.entity';
import type { ProductRepository } from '../repositories/product.repository';

export type CreateProductInput = Omit<CreateProductData, 'precioVenta' | 'activo'> & {
  /** Si no se envía, se calcula con el costo y el % de ganancia. */
  precioVenta?: number;
};

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<ProductEntity> {
    const nombre = input.nombre.trim();
    if (await this.productRepository.existsByName(nombre)) {
      throw new ConflictError(`Ya existe un producto llamado "${nombre}"`, 'nombre');
    }

    return this.productRepository.create({
      ...input,
      nombre,
      precioVenta: input.precioVenta ?? salePriceFromCost(input.precioCompra, input.porcentajeGanancia),
      activo: true,
    });
  }
}
