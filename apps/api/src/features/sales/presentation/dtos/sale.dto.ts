import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PAYMENT_METHODS, type PaymentMethod } from '@/core/constants/collections';
import { DateRangeQueryDto } from '@/core/presentation/dtos/date-range-query.dto';
import type { SaleType } from '../../domain/entities/sale.entity';

class SaleLineDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @IsPositive()
  cantidad: number;
}

export class CreateSaleDto {
  @IsMongoId()
  cashSessionId: string;

  @IsIn(['productos', 'total'])
  tipo: SaleType;

  @IsIn(PAYMENT_METHODS)
  metodoPago: PaymentMethod;

  @ValidateIf((dto: CreateSaleDto) => dto.tipo === 'productos')
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleLineDto)
  items?: SaleLineDto[];

  @ValidateIf((dto: CreateSaleDto) => dto.tipo === 'total')
  @IsNumber()
  @IsPositive()
  total?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @IsOptional()
  @IsString()
  nota?: string;
}

export class SalesQueryDto extends DateRangeQueryDto {
  @IsOptional()
  @IsMongoId()
  cashSessionId?: string;
}
