import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type {
  SavingsDepositEntity,
  SavingsGoalEntity,
  SavingsGoalProgress,
} from '../../domain/entities/savings.entity';
import {
  AddSavingsDepositUseCase,
  CreateSavingsGoalUseCase,
  GetSavingsGoalsUseCase,
  UpdateSavingsGoalUseCase,
} from '../../domain/usecases';
import { AddSavingsDepositDto, CreateSavingsGoalDto, UpdateSavingsGoalDto } from '../dtos/savings.dto';

@Controller('savings/goals')
export class SavingsController {
  constructor(
    private readonly getSavingsGoalsUseCase: GetSavingsGoalsUseCase,
    private readonly createSavingsGoalUseCase: CreateSavingsGoalUseCase,
    private readonly updateSavingsGoalUseCase: UpdateSavingsGoalUseCase,
    private readonly addSavingsDepositUseCase: AddSavingsDepositUseCase,
  ) {}

  @Get()
  findAll(): Promise<SavingsGoalProgress[]> {
    return this.getSavingsGoalsUseCase.execute();
  }

  @Post()
  create(@Body() dto: CreateSavingsGoalDto): Promise<SavingsGoalEntity> {
    return this.createSavingsGoalUseCase.execute(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSavingsGoalDto): Promise<SavingsGoalEntity> {
    return this.updateSavingsGoalUseCase.execute(id, dto);
  }

  @Post(':id/deposits')
  deposit(@Param('id') goalId: string, @Body() dto: AddSavingsDepositDto): Promise<SavingsDepositEntity> {
    return this.addSavingsDepositUseCase.execute({ goalId, ...dto });
  }
}
