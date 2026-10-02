import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PRODUCT_TOKENS } from '../products/di/products.tokens';
import type { ProductRepository } from '../products/domain/repositories/product.repository';
import { ProductsModule } from '../products/products.module';
import { SUPPLIER_TOKENS } from '../suppliers/di/suppliers.tokens';
import type { SupplierRepository } from '../suppliers/domain/repositories/supplier.repository';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { MongoPurchaseDataSource, type PurchaseDataSource } from './data/datasources/purchase.datasource';
import { PURCHASE_MODEL, PurchaseSchema } from './data/models/purchase.models';
import { PurchaseRepositoryImpl } from './data/repositories/purchase.repository.impl';
import { PURCHASE_TOKENS } from './di/purchases.tokens';
import type { PurchaseRepository } from './domain/repositories/purchase.repository';
import {
  CancelPurchaseUseCase,
  CreatePurchaseUseCase,
  GetLastSupplierPurchaseUseCase,
  GetPurchaseByIdUseCase,
  GetPurchasesUseCase,
  ReceivePurchaseUseCase,
} from './domain/usecases';
import { PurchasesController } from './presentation/controllers/purchases.controller';

const repo = PURCHASE_TOKENS.PurchaseRepository;
const productRepo = PRODUCT_TOKENS.ProductRepository;
const supplierRepo = SUPPLIER_TOKENS.SupplierRepository;

@Module({
  imports: [MongooseModule.forFeature([{ name: PURCHASE_MODEL, schema: PurchaseSchema }]), ProductsModule, SuppliersModule],
  controllers: [PurchasesController],
  providers: [
    // Data
    { provide: PURCHASE_TOKENS.PurchaseDataSource, useClass: MongoPurchaseDataSource },
    {
      provide: repo,
      useFactory: (ds: PurchaseDataSource) => new PurchaseRepositoryImpl(ds),
      inject: [PURCHASE_TOKENS.PurchaseDataSource],
    },
    // Casos de uso
    {
      provide: CreatePurchaseUseCase,
      useFactory: (r: PurchaseRepository, p: ProductRepository, s: SupplierRepository) => new CreatePurchaseUseCase(r, p, s),
      inject: [repo, productRepo, supplierRepo],
    },
    {
      provide: ReceivePurchaseUseCase,
      useFactory: (r: PurchaseRepository, p: ProductRepository) => new ReceivePurchaseUseCase(r, p),
      inject: [repo, productRepo],
    },
    { provide: GetPurchasesUseCase, useFactory: (r: PurchaseRepository) => new GetPurchasesUseCase(r), inject: [repo] },
    { provide: GetPurchaseByIdUseCase, useFactory: (r: PurchaseRepository) => new GetPurchaseByIdUseCase(r), inject: [repo] },
    {
      provide: GetLastSupplierPurchaseUseCase,
      useFactory: (r: PurchaseRepository) => new GetLastSupplierPurchaseUseCase(r),
      inject: [repo],
    },
    { provide: CancelPurchaseUseCase, useFactory: (r: PurchaseRepository) => new CancelPurchaseUseCase(r), inject: [repo] },
  ],
})
export class PurchasesModule {}
