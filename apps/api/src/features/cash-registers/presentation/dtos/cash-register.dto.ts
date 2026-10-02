import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import type { CashSessionStatus } from '../../domain/entities/cash-register.entity';

export class CreateCashRegisterDto {
  @IsString()
  @MinLength(1)
  nombre: string;
}

export class OpenCashSessionDto {
  @IsMongoId()
  cashRegisterId: string;

  @IsString()
  @MinLength(1)
  cajero: string;

  @IsNumber()
  @Min(0)
  base: number;

  @IsOptional()
  @IsString()
  notaApertura?: string;
}

export class CashSessionsQueryDto {
  @IsOptional()
  @IsIn(['abierta', 'cerrada'])
  estado?: CashSessionStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(366)
  dias?: number;
}

export class AddCashIncomeDto {
  @IsString()
  @MinLength(1)
  concepto: string;

  @IsNumber()
  @IsPositive()
  monto: number;
}

class CashCountLineDto {
  @IsNumber()
  @IsPositive()
  denominacion: number;

  @IsInt()
  @Min(0)
  cantidad: number;
}

export class CloseCashSessionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CashCountLineDto)
  conteo: CashCountLineDto[];

  @IsNumber()
  @Min(0)
  monedas: number;

  @IsOptional()
  @IsString()
  observacion?: string;
}
