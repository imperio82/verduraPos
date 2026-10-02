import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type { SupplierEntity } from '../../domain/entities/supplier.entity';
import {
  CreateSupplierUseCase,
  GetSupplierByIdUseCase,
  GetSuppliersUseCase,
  UpdateSupplierUseCase,
} from '../../domain/usecases';
import { CreateSupplierDto, UpdateSupplierDto } from '../dtos/supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(
    private readonly getSuppliersUseCase: GetSuppliersUseCase,
    private readonly getSupplierByIdUseCase: GetSupplierByIdUseCase,
    private readonly createSupplierUseCase: CreateSupplierUseCase,
    private readonly updateSupplierUseCase: UpdateSupplierUseCase,
  ) {}

  @Get()
  findAll(): Promise<SupplierEntity[]> {
    return this.getSuppliersUseCase.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupplierEntity> {
    return this.getSupplierByIdUseCase.execute(id);
  }

  @Post()
  create(@Body() dto: CreateSupplierDto): Promise<SupplierEntity> {
    return this.createSupplierUseCase.execute(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto): Promise<SupplierEntity> {
    return this.updateSupplierUseCase.execute(id, dto);
  }
}
