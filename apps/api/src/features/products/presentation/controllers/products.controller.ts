import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { ProductEntity } from '../../domain/entities/product.entity';
import {
  CreateProductUseCase,
  GetProductByIdUseCase,
  GetProductsUseCase,
  UpdateProductUseCase,
} from '../../domain/usecases';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from '../dtos/product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
  ) {}

  @Get()
  findAll(@Query() query: ProductQueryDto): Promise<ProductEntity[]> {
    return this.getProductsUseCase.execute({
      categoria: query.categoria,
      search: query.search,
      soloActivos: !query.incluirInactivos,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductEntity> {
    return this.getProductByIdUseCase.execute(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto): Promise<ProductEntity> {
    return this.createProductUseCase.execute(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<ProductEntity> {
    return this.updateProductUseCase.execute(id, dto);
  }
}
