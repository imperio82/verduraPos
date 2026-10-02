import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoCashRegisterDataSource, type CashRegisterDataSource } from './data/datasources/cash-register.datasource';
import { MongoCashSessionActivityReader } from './data/datasources/cash-session-activity.reader';
import {
  CASH_MOVEMENT_MODEL,
  CASH_REGISTER_MODEL,
  CASH_SESSION_MODEL,
  CashMovementSchema,
  CashRegisterSchema,
  CashSessionSchema,
} from './data/models/cash-register.models';
import { CashRegisterRepositoryImpl } from './data/repositories/cash-register.repository.impl';
import { CASH_REGISTER_TOKENS } from './di/cash-registers.tokens';
import type {
  CashRegisterRepository,
  CashSessionActivityReader,
} from './domain/repositories/cash-register.repository';
import {
  AddCashIncomeUseCase,
  CashSessionGuard,
  CloseCashSessionUseCase,
  CreateCashRegisterUseCase,
  GetCashRegistersUseCase,
  GetCashSessionDetailUseCase,
  GetCashSessionsUseCase,
  OpenCashSessionUseCase,
} from './domain/usecases';
import { CashRegistersController } from './presentation/controllers/cash-registers.controller';

const repo = CASH_REGISTER_TOKENS.CashRegisterRepository;
const reader = CASH_REGISTER_TOKENS.CashSessionActivityReader;

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CASH_REGISTER_MODEL, schema: CashRegisterSchema },
      { name: CASH_SESSION_MODEL, schema: CashSessionSchema },
      { name: CASH_MOVEMENT_MODEL, schema: CashMovementSchema },
    ]),
  ],
  controllers: [CashRegistersController],
  providers: [
    // Data
    { provide: CASH_REGISTER_TOKENS.CashRegisterDataSource, useClass: MongoCashRegisterDataSource },
    { provide: reader, useClass: MongoCashSessionActivityReader },
    {
      provide: repo,
      useFactory: (ds: CashRegisterDataSource) => new CashRegisterRepositoryImpl(ds),
      inject: [CASH_REGISTER_TOKENS.CashRegisterDataSource],
    },
    // Domain
    { provide: CashSessionGuard, useFactory: (r: CashRegisterRepository) => new CashSessionGuard(r), inject: [repo] },
    { provide: GetCashRegistersUseCase, useFactory: (r: CashRegisterRepository) => new GetCashRegistersUseCase(r), inject: [repo] },
    { provide: CreateCashRegisterUseCase, useFactory: (r: CashRegisterRepository) => new CreateCashRegisterUseCase(r), inject: [repo] },
    { provide: OpenCashSessionUseCase, useFactory: (r: CashRegisterRepository) => new OpenCashSessionUseCase(r), inject: [repo] },
    {
      provide: GetCashSessionsUseCase,
      useFactory: (r: CashRegisterRepository, a: CashSessionActivityReader) => new GetCashSessionsUseCase(r, a),
      inject: [repo, reader],
    },
    {
      provide: GetCashSessionDetailUseCase,
      useFactory: (r: CashRegisterRepository, a: CashSessionActivityReader) => new GetCashSessionDetailUseCase(r, a),
      inject: [repo, reader],
    },
    {
      provide: AddCashIncomeUseCase,
      useFactory: (r: CashRegisterRepository, g: CashSessionGuard) => new AddCashIncomeUseCase(r, g),
      inject: [repo, CashSessionGuard],
    },
    {
      provide: CloseCashSessionUseCase,
      useFactory: (r: CashRegisterRepository, a: CashSessionActivityReader, g: CashSessionGuard) =>
        new CloseCashSessionUseCase(r, a, g),
      inject: [repo, reader, CashSessionGuard],
    },
  ],
  exports: [CashSessionGuard],
})
export class CashRegistersModule {}
