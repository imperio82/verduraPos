import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoProductDataSource, type ProductDataSource } from './data/datasources/product.datasource';
import { PRODUCT_MODEL, ProductSchema } from './data/models/product.model';
import { ProductRepositoryImpl } from './data/repositories/product.repository.impl';
import { PRODUCT_TOKENS } from './di/products.tokens';
import type { ProductRepository } from './domain/repositories/product.repository';
import {
  CreateProductUseCase,
  GetProductByIdUseCase,
  GetProductsUseCase,
  UpdateProductUseCase,
} from './domain/usecases';
import { ProductsController } from './presentation/controllers/products.controller';

const repo = PRODUCT_TOKENS.ProductRepository;

@Module({
  imports: [MongooseModule.forFeature([{ name: PRODUCT_MODEL, schema: ProductSchema }])],
  controllers: [ProductsController],
  providers: [
    // Data
    { provide: PRODUCT_TOKENS.ProductDataSource, useClass: MongoProductDataSource },
    {
      provide: repo,
      useFactory: (ds: ProductDataSource) => new ProductRepositoryImpl(ds),
      inject: [PRODUCT_TOKENS.ProductDataSource],
    },
    // Use cases (clases puras de dominio, se construyen por fábrica)
    { provide: GetProductsUseCase, useFactory: (r: ProductRepository) => new GetProductsUseCase(r), inject: [repo] },
    { provide: GetProductByIdUseCase, useFactory: (r: ProductRepository) => new GetProductByIdUseCase(r), inject: [repo] },
    { provide: CreateProductUseCase, useFactory: (r: ProductRepository) => new CreateProductUseCase(r), inject: [repo] },
    { provide: UpdateProductUseCase, useFactory: (r: ProductRepository) => new UpdateProductUseCase(r), inject: [repo] },
  ],
  exports: [repo],
})
export class ProductsModule {}
