import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsBoolean, IsHexColor, IsIn, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  type ProductCategory,
  type ProductUnit,
} from '../../domain/entities/product.entity';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsIn(PRODUCT_CATEGORIES)
  categoria: ProductCategory;

  @IsIn(PRODUCT_UNITS)
  unidad: ProductUnit;

  @IsNumber()
  @Min(0)
  precioCompra: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  porcentajeGanancia: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioVenta?: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  stockMinimo: number;

  @IsHexColor()
  color: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ProductQueryDto {
  @IsOptional()
  @IsIn(PRODUCT_CATEGORIES)
  categoria?: ProductCategory;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  incluirInactivos?: boolean;
}
