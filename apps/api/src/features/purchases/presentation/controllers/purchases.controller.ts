import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { toDateRange } from '@/core';
import type { PurchaseEntity } from '../../domain/entities/purchase.entity';
import {
  CancelPurchaseUseCase,
  CreatePurchaseUseCase,
  GetLastSupplierPurchaseUseCase,
  GetPurchaseByIdUseCase,
  GetPurchasesUseCase,
  ReceivePurchaseUseCase,
} from '../../domain/usecases';
import { CreatePurchaseDto, PurchasesQueryDto, ReceivePurchaseDto } from '../dtos/purchase.dto';

@Controller('purchases')
export class PurchasesController {
  constructor(
    private readonly createPurchaseUseCase: CreatePurchaseUseCase,
    private readonly getPurchasesUseCase: GetPurchasesUseCase,
    private readonly getPurchaseByIdUseCase: GetPurchaseByIdUseCase,
    private readonly getLastSupplierPurchaseUseCase: GetLastSupplierPurchaseUseCase,
    private readonly receivePurchaseUseCase: ReceivePurchaseUseCase,
    private readonly cancelPurchaseUseCase: CancelPurchaseUseCase,
  ) {}

  @Get()
  findAll(@Query() query: PurchasesQueryDto): Promise<PurchaseEntity[]> {
    const range = query.from || query.to ? toDateRange(query.from, query.to) : {};
    return this.getPurchasesUseCase.execute({ supplierId: query.supplierId, estado: query.estado, ...range });
  }

  @Get('last/:supplierId')
  lastBySupplier(@Param('supplierId') supplierId: string): Promise<PurchaseEntity | null> {
    return this.getLastSupplierPurchaseUseCase.execute(supplierId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PurchaseEntity> {
    return this.getPurchaseByIdUseCase.execute(id);
  }

  @Post()
  create(@Body() dto: CreatePurchaseDto): Promise<PurchaseEntity> {
    return this.createPurchaseUseCase.execute(dto);
  }

  @Post(':id/receive')
  receive(@Param('id') id: string, @Body() dto: ReceivePurchaseDto): Promise<PurchaseEntity> {
    return this.receivePurchaseUseCase.execute(id, dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string): Promise<PurchaseEntity> {
    return this.cancelPurchaseUseCase.execute(id);
  }
}
