import { IsBoolean, IsIn, IsMongoId, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { SAVINGS_PERIODS, type SavingsPeriod } from '../../domain/entities/savings.entity';

export class CreateSavingsGoalDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsNumber()
  @IsPositive()
  meta: number;

  @IsIn(SAVINGS_PERIODS)
  periodo: SavingsPeriod;

  @IsNumber()
  @IsPositive()
  aportePeriodo: number;
}

export class UpdateSavingsGoalDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  meta?: number;

  @IsOptional()
  @IsIn(SAVINGS_PERIODS)
  periodo?: SavingsPeriod;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  aportePeriodo?: number;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class AddSavingsDepositDto {
  @IsNumber()
  @IsPositive()
  monto: number;

  @IsOptional()
  @IsMongoId()
  cashSessionId?: string;
}
