import { Controller, Get, Module } from '@nestjs/common';
import { databaseState, DatabaseModule } from './core/database/database.module';
import { AccountingModule } from './features/accounting/accounting.module';
import { CashRegistersModule } from './features/cash-registers/cash-registers.module';
import { ExpensesModule } from './features/expenses/expenses.module';
import { InventoryModule } from './features/inventory/inventory.module';
import { ProductsModule } from './features/products/products.module';
import { PurchasesModule } from './features/purchases/purchases.module';
import { SalesModule } from './features/sales/sales.module';
import { SavingsModule } from './features/savings/savings.module';
import { SuppliersModule } from './features/suppliers/suppliers.module';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { ok: true, database: databaseState.inMemory ? 'memory' : 'mongodb' };
  }
}

@Module({
  imports: [
    DatabaseModule,
    ProductsModule,
    SuppliersModule,
    CashRegistersModule,
    SalesModule,
    ExpensesModule,
    SavingsModule,
    AccountingModule,
    PurchasesModule,
    InventoryModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
