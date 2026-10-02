import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashRegistersModule } from '../cash-registers/cash-registers.module';
import { CashSessionGuard } from '../cash-registers/domain/usecases';
import { PRODUCT_TOKENS } from '../products/di/products.tokens';
import type { ProductRepository } from '../products/domain/repositories/product.repository';
import { ProductsModule } from '../products/products.module';
import { MongoInventoryDataSource, type InventoryDataSource } from './data/datasources/inventory.datasource';
import { DAMAGE_MODEL, DamageSchema, RECOUNT_MODEL, RecountSchema } from './data/models/inventory.models';
import { InventoryRepositoryImpl } from './data/repositories/inventory.repository.impl';
import { INVENTORY_TOKENS } from './di/inventory.tokens';
import type { InventoryRepository } from './domain/repositories/inventory.repository';
import {
  GetDamageSummaryUseCase,
  GetLastRecountUseCase,
  RegisterDamageUseCase,
  RegisterRecountUseCase,
} from './domain/usecases';
import { InventoryController } from './presentation/controllers/inventory.controller';

const repo = INVENTORY_TOKENS.InventoryRepository;
const productRepo = PRODUCT_TOKENS.ProductRepository;

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RECOUNT_MODEL, schema: RecountSchema },
      { name: DAMAGE_MODEL, schema: DamageSchema },
    ]),
    ProductsModule,
    CashRegistersModule,
  ],
  controllers: [InventoryController],
  providers: [
    { provide: INVENTORY_TOKENS.InventoryDataSource, useClass: MongoInventoryDataSource },
    {
      provide: repo,
      useFactory: (ds: InventoryDataSource) => new InventoryRepositoryImpl(ds),
      inject: [INVENTORY_TOKENS.InventoryDataSource],
    },
    {
      provide: RegisterRecountUseCase,
      useFactory: (r: InventoryRepository, p: ProductRepository, g: CashSessionGuard) => new RegisterRecountUseCase(r, p, g),
      inject: [repo, productRepo, CashSessionGuard],
    },
    { provide: GetLastRecountUseCase, useFactory: (r: InventoryRepository) => new GetLastRecountUseCase(r), inject: [repo] },
    {
      provide: RegisterDamageUseCase,
      useFactory: (r: InventoryRepository, p: ProductRepository, g: CashSessionGuard) => new RegisterDamageUseCase(r, p, g),
      inject: [repo, productRepo, CashSessionGuard],
    },
    { provide: GetDamageSummaryUseCase, useFactory: (r: InventoryRepository) => new GetDamageSummaryUseCase(r), inject: [repo] },
  ],
})
export class InventoryModule {}
