import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashRegistersModule } from '../cash-registers/cash-registers.module';
import { CashSessionGuard } from '../cash-registers/domain/usecases';
import { MongoSavingsDataSource, type SavingsDataSource } from './data/datasources/savings.datasource';
import {
  SAVINGS_DEPOSIT_MODEL,
  SAVINGS_GOAL_MODEL,
  SavingsDepositSchema,
  SavingsGoalSchema,
} from './data/models/savings.models';
import { SavingsRepositoryImpl } from './data/repositories/savings.repository.impl';
import { SAVINGS_TOKENS } from './di/savings.tokens';
import type { SavingsRepository } from './domain/repositories/savings.repository';
import {
  AddSavingsDepositUseCase,
  CreateSavingsGoalUseCase,
  GetSavingsGoalsUseCase,
  UpdateSavingsGoalUseCase,
} from './domain/usecases';
import { SavingsController } from './presentation/controllers/savings.controller';

const repo = SAVINGS_TOKENS.SavingsRepository;

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SAVINGS_GOAL_MODEL, schema: SavingsGoalSchema },
      { name: SAVINGS_DEPOSIT_MODEL, schema: SavingsDepositSchema },
    ]),
    CashRegistersModule,
  ],
  controllers: [SavingsController],
  providers: [
    { provide: SAVINGS_TOKENS.SavingsDataSource, useClass: MongoSavingsDataSource },
    {
      provide: repo,
      useFactory: (ds: SavingsDataSource) => new SavingsRepositoryImpl(ds),
      inject: [SAVINGS_TOKENS.SavingsDataSource],
    },
    { provide: GetSavingsGoalsUseCase, useFactory: (r: SavingsRepository) => new GetSavingsGoalsUseCase(r), inject: [repo] },
    { provide: CreateSavingsGoalUseCase, useFactory: (r: SavingsRepository) => new CreateSavingsGoalUseCase(r), inject: [repo] },
    { provide: UpdateSavingsGoalUseCase, useFactory: (r: SavingsRepository) => new UpdateSavingsGoalUseCase(r), inject: [repo] },
    {
      provide: AddSavingsDepositUseCase,
      useFactory: (r: SavingsRepository, g: CashSessionGuard) => new AddSavingsDepositUseCase(r, g),
      inject: [repo, CashSessionGuard],
    },
  ],
  exports: [GetSavingsGoalsUseCase],
})
export class SavingsModule {}
