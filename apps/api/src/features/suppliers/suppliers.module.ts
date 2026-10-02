import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoSupplierDataSource, type SupplierDataSource } from './data/datasources/supplier.datasource';
import { SUPPLIER_MODEL, SupplierSchema } from './data/models/supplier.model';
import { SupplierRepositoryImpl } from './data/repositories/supplier.repository.impl';
import { SUPPLIER_TOKENS } from './di/suppliers.tokens';
import type { SupplierRepository } from './domain/repositories/supplier.repository';
import {
  CreateSupplierUseCase,
  GetSupplierByIdUseCase,
  GetSuppliersUseCase,
  UpdateSupplierUseCase,
} from './domain/usecases';
import { SuppliersController } from './presentation/controllers/suppliers.controller';

const repo = SUPPLIER_TOKENS.SupplierRepository;

@Module({
  imports: [MongooseModule.forFeature([{ name: SUPPLIER_MODEL, schema: SupplierSchema }])],
  controllers: [SuppliersController],
  providers: [
    { provide: SUPPLIER_TOKENS.SupplierDataSource, useClass: MongoSupplierDataSource },
    {
      provide: repo,
      useFactory: (ds: SupplierDataSource) => new SupplierRepositoryImpl(ds),
      inject: [SUPPLIER_TOKENS.SupplierDataSource],
    },
    { provide: GetSuppliersUseCase, useFactory: (r: SupplierRepository) => new GetSuppliersUseCase(r), inject: [repo] },
    { provide: GetSupplierByIdUseCase, useFactory: (r: SupplierRepository) => new GetSupplierByIdUseCase(r), inject: [repo] },
    { provide: CreateSupplierUseCase, useFactory: (r: SupplierRepository) => new CreateSupplierUseCase(r), inject: [repo] },
    { provide: UpdateSupplierUseCase, useFactory: (r: SupplierRepository) => new UpdateSupplierUseCase(r), inject: [repo] },
  ],
  exports: [repo],
})
export class SuppliersModule {}
