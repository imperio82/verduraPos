import { IsIn, IsMongoId, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_PAYMENT_METHODS,
  type ExpenseCategory,
  type ExpensePaymentMethod,
} from '../../domain/entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  @MinLength(2)
  concepto: string;

  @IsIn(EXPENSE_CATEGORIES)
  destino: ExpenseCategory;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsOptional()
  @IsIn(EXPENSE_PAYMENT_METHODS)
  metodoPago?: ExpensePaymentMethod;

  @IsOptional()
  @IsMongoId()
  cashSessionId?: string;
}
