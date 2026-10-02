import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { lastDays, toDateRange } from '@/core';
import { DateRangeQueryDto } from '@/core/presentation/dtos/date-range-query.dto';
import type { DamageEntity, DamageSummary, RecountEntity } from '../../domain/entities/inventory.entity';
import {
  GetDamageSummaryUseCase,
  GetLastRecountUseCase,
  RegisterDamageUseCase,
  RegisterRecountUseCase,
} from '../../domain/usecases';
import { RegisterDamageDto, RegisterRecountDto } from '../dtos/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly registerRecountUseCase: RegisterRecountUseCase,
    private readonly getLastRecountUseCase: GetLastRecountUseCase,
    private readonly registerDamageUseCase: RegisterDamageUseCase,
    private readonly getDamageSummaryUseCase: GetDamageSummaryUseCase,
  ) {}

  @Get('recounts/last')
  lastRecount(): Promise<RecountEntity | null> {
    return this.getLastRecountUseCase.execute();
  }

  @Post('recounts')
  recount(@Body() dto: RegisterRecountDto): Promise<RecountEntity> {
    return this.registerRecountUseCase.execute(dto);
  }

  /** Sin fechas: últimos 7 días. */
  @Get('damages')
  damages(@Query() query: DateRangeQueryDto): Promise<DamageSummary> {
    const range = query.from || query.to ? toDateRange(query.from, query.to) : lastDays(7);
    return this.getDamageSummaryUseCase.execute(range);
  }

  @Post('damages')
  registerDamage(@Body() dto: RegisterDamageDto): Promise<DamageEntity> {
    return this.registerDamageUseCase.execute(dto);
  }
}
