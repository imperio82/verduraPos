import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { DateRangeQueryDto } from '@/core/presentation/dtos/date-range-query.dto';
import {
  PURCHASE_ITEM_STATUSES,
  PURCHASE_STATUSES,
  type PurchaseItemStatus,
  type PurchaseStatus,
} from '../../domain/entities/purchase.entity';

class PurchaseLineDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioCompra?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  porcentajeGanancia?: number;
}

export class CreatePurchaseDto {
  @IsMongoId()
  supplierId: string;

  @IsOptional()
  @IsString()
  numeroFactura?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaFactura?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaEntrega?: Date;

  @IsNumber()
  @Min(0)
  @Max(1000)
  porcentajeGananciaGeneral: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseLineDto)
  items: PurchaseLineDto[];

  @IsOptional()
  @IsString()
  nota?: string;
}

export class PurchasesQueryDto extends DateRangeQueryDto {
  @IsOptional()
  @IsMongoId()
  supplierId?: string;

  @IsOptional()
  @IsIn(PURCHASE_STATUSES)
  estado?: PurchaseStatus;
}

class ReceiveLineDto {
  @IsMongoId()
  productId: string;

  @IsIn(PURCHASE_ITEM_STATUSES)
  estado: PurchaseItemStatus;

  @IsNumber()
  @Min(0)
  cantidadRecibida: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidadMala?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioCompra?: number;
}

export class ReceivePurchaseDto {
  @IsOptional()
  @IsString()
  numeroFactura?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaFactura?: Date;

  @IsOptional()
  @IsString()
  nota?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveLineDto)
  items: ReceiveLineDto[];
}
