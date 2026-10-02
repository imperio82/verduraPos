import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import type {
  CashMovementEntity,
  CashRegisterEntity,
  CashSessionEntity,
} from '../../domain/entities/cash-register.entity';
import {
  AddCashIncomeUseCase,
  CloseCashSessionUseCase,
  CreateCashRegisterUseCase,
  GetCashRegistersUseCase,
  GetCashSessionDetailUseCase,
  GetCashSessionsUseCase,
  OpenCashSessionUseCase,
  type CashRegisterWithStatus,
  type CashSessionDetail,
  type CashSessionSummary,
} from '../../domain/usecases';
import {
  AddCashIncomeDto,
  CashSessionsQueryDto,
  CloseCashSessionDto,
  CreateCashRegisterDto,
  OpenCashSessionDto,
} from '../dtos/cash-register.dto';

@Controller('cash-registers')
export class CashRegistersController {
  constructor(
    private readonly getCashRegistersUseCase: GetCashRegistersUseCase,
    private readonly createCashRegisterUseCase: CreateCashRegisterUseCase,
    private readonly openCashSessionUseCase: OpenCashSessionUseCase,
    private readonly getCashSessionsUseCase: GetCashSessionsUseCase,
    private readonly getCashSessionDetailUseCase: GetCashSessionDetailUseCase,
    private readonly addCashIncomeUseCase: AddCashIncomeUseCase,
    private readonly closeCashSessionUseCase: CloseCashSessionUseCase,
  ) {}

  @Get()
  findRegisters(): Promise<CashRegisterWithStatus[]> {
    return this.getCashRegistersUseCase.execute();
  }

  @Post()
  createRegister(@Body() dto: CreateCashRegisterDto): Promise<CashRegisterEntity> {
    return this.createCashRegisterUseCase.execute(dto.nombre);
  }

  @Get('sessions')
  findSessions(@Query() query: CashSessionsQueryDto): Promise<CashSessionSummary[]> {
    return this.getCashSessionsUseCase.execute(query);
  }

  @Post('sessions')
  openSession(@Body() dto: OpenCashSessionDto): Promise<CashSessionEntity> {
    return this.openCashSessionUseCase.execute(dto);
  }

  @Get('sessions/:id')
  findSession(@Param('id') id: string): Promise<CashSessionDetail> {
    return this.getCashSessionDetailUseCase.execute(id);
  }

  @Post('sessions/:id/incomes')
  addIncome(@Param('id') id: string, @Body() dto: AddCashIncomeDto): Promise<CashMovementEntity> {
    return this.addCashIncomeUseCase.execute(id, dto.concepto, dto.monto);
  }

  @Post('sessions/:id/close')
  close(@Param('id') id: string, @Body() dto: CloseCashSessionDto): Promise<CashSessionEntity> {
    return this.closeCashSessionUseCase.execute(id, dto);
  }
}
