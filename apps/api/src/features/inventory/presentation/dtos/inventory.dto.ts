import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsMongoId, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';

class RecountLineDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(0)
  contado: number;
}

export class RegisterRecountDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecountLineDto)
  items: RecountLineDto[];

  @IsOptional()
  @IsString()
  nota?: string;

  @IsOptional()
  @IsMongoId()
  cashSessionId?: string;
}

export class RegisterDamageDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @IsPositive()
  cantidad: number;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsMongoId()
  cashSessionId?: string;
}
