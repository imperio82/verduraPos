import { Controller, Get, Query } from '@nestjs/common';
import { toDateRange } from '@/core';
import { DateRangeQueryDto } from '@/core/presentation/dtos/date-range-query.dto';
import type { AccountingSummary } from '../../domain/entities/accounting-summary.entity';
import { GetAccountingSummaryUseCase } from '../../domain/usecases/get-accounting-summary.usecase';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly getAccountingSummaryUseCase: GetAccountingSummaryUseCase) {}

  /** GET /accounting/summary?from=2026-09-23&to=2026-09-29 */
  @Get('summary')
  summary(@Query() query: DateRangeQueryDto): Promise<AccountingSummary> {
    return this.getAccountingSummaryUseCase.execute(toDateRange(query.from, query.to));
  }
}
