import type { DateRange } from '@/core';
import type {
  DailySalesTotal,
  NewSale,
  SaleEntity,
  SaleFilters,
  SalesTotals,
} from '../../domain/entities/sale.entity';
import type { SaleRepository } from '../../domain/repositories/sale.repository';
import type { SaleDataSource } from '../datasources/sale.datasource';
import { toSaleEntity } from '../models/sale.model';

export class SaleRepositoryImpl implements SaleRepository {
  constructor(private readonly dataSource: SaleDataSource) {}

  async create(sale: NewSale): Promise<SaleEntity> {
    const numero = await this.dataSource.nextNumber();
    return toSaleEntity(await this.dataSource.create(sale, numero));
  }

  async findAll(filters: SaleFilters): Promise<SaleEntity[]> {
    return (await this.dataSource.find(filters)).map(toSaleEntity);
  }

  async peekNextNumber(): Promise<number> {
    return (await this.dataSource.currentNumber()) + 1;
  }

  async totals(range: DateRange): Promise<SalesTotals> {
    const rows = await this.dataSource.totalsByMethod(range);
    const result: SalesTotals = { count: 0, total: 0, porMetodo: { efectivo: 0, transferencia: 0, tarjeta: 0 } };
    for (const row of rows) {
      result.count += row.count;
      result.total += row.total;
      result.porMetodo[row._id] = row.total;
    }
    return result;
  }

  async dailyTotals(range: DateRange): Promise<DailySalesTotal[]> {
    const rows = await this.dataSource.totalsByDay(range);
    return rows.map((row) => ({ fecha: row._id, total: row.total }));
  }
}
