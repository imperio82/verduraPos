import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashRegistersModule } from '../cash-registers/cash-registers.module';
import { CashSessionGuard } from '../cash-registers/domain/usecases';
import { PRODUCT_TOKENS } from '../products/di/products.tokens';
import type { ProductRepository } from '../products/domain/repositories/product.repository';
import { ProductsModule } from '../products/products.module';
import { MongoSaleDataSource, type SaleDataSource } from './data/datasources/sale.datasource';
import { SALE_MODEL, SaleSchema } from './data/models/sale.model';
import { SaleRepositoryImpl } from './data/repositories/sale.repository.impl';
import { SALE_TOKENS } from './di/sales.tokens';
import type { SaleRepository } from './domain/repositories/sale.repository';
import { CreateSaleUseCase, GetNextSaleNumberUseCase, GetSalesUseCase } from './domain/usecases';
import { SalesController } from './presentation/controllers/sales.controller';

const repo = SALE_TOKENS.SaleRepository;

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SALE_MODEL, schema: SaleSchema }]),
    ProductsModule,
    CashRegistersModule,
  ],
  controllers: [SalesController],
  providers: [
    { provide: SALE_TOKENS.SaleDataSource, useClass: MongoSaleDataSource },
    {
      provide: repo,
      useFactory: (ds: SaleDataSource) => new SaleRepositoryImpl(ds),
      inject: [SALE_TOKENS.SaleDataSource],
    },
    {
      provide: CreateSaleUseCase,
      useFactory: (r: SaleRepository, p: ProductRepository, g: CashSessionGuard) => new CreateSaleUseCase(r, p, g),
      inject: [repo, PRODUCT_TOKENS.ProductRepository, CashSessionGuard],
    },
    { provide: GetSalesUseCase, useFactory: (r: SaleRepository) => new GetSalesUseCase(r), inject: [repo] },
    { provide: GetNextSaleNumberUseCase, useFactory: (r: SaleRepository) => new GetNextSaleNumberUseCase(r), inject: [repo] },
  ],
  exports: [repo],
})
export class SalesModule {}
