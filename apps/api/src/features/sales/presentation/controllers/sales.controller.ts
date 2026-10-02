import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { toDateRange } from '@/core';
import type { SaleEntity } from '../../domain/entities/sale.entity';
import { CreateSaleUseCase, GetNextSaleNumberUseCase, GetSalesUseCase } from '../../domain/usecases';
import { CreateSaleDto, SalesQueryDto } from '../dtos/sale.dto';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly createSaleUseCase: CreateSaleUseCase,
    private readonly getSalesUseCase: GetSalesUseCase,
    private readonly getNextSaleNumberUseCase: GetNextSaleNumberUseCase,
  ) {}

  @Get()
  findAll(@Query() query: SalesQueryDto): Promise<SaleEntity[]> {
    const range = query.from || query.to || !query.cashSessionId ? toDateRange(query.from, query.to) : undefined;
    return this.getSalesUseCase.execute({ cashSessionId: query.cashSessionId, ...range });
  }

  @Get('next-number')
  async nextNumber(): Promise<{ numero: number }> {
    return { numero: await this.getNextSaleNumberUseCase.execute() };
  }

  @Post()
  create(@Body() dto: CreateSaleDto): Promise<SaleEntity> {
    return this.createSaleUseCase.execute(dto);
  }
}
