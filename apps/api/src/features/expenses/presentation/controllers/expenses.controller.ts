import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { toDateRange } from '@/core';
import { DateRangeQueryDto } from '@/core/presentation/dtos/date-range-query.dto';
import type { ExpenseEntity } from '../../domain/entities/expense.entity';
import { CreateExpenseUseCase, GetExpensesUseCase } from '../../domain/usecases';
import { CreateExpenseDto } from '../dtos/expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly getExpensesUseCase: GetExpensesUseCase,
  ) {}

  @Get()
  findAll(@Query() query: DateRangeQueryDto): Promise<ExpenseEntity[]> {
    return this.getExpensesUseCase.execute(toDateRange(query.from, query.to));
  }

  @Post()
  create(@Body() dto: CreateExpenseDto): Promise<ExpenseEntity> {
    return this.createExpenseUseCase.execute(dto);
  }
}
