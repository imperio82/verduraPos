import type { DateRange } from '@/core';
import type { DailySalesTotal, NewSale, SaleEntity, SaleFilters, SalesTotals } from '../entities/sale.entity';

export interface SaleRepository {
  /** Asigna el consecutivo y guarda la venta. */
  create(sale: NewSale): Promise<SaleEntity>;
  findAll(filters: SaleFilters): Promise<SaleEntity[]>;
  peekNextNumber(): Promise<number>;
  totals(range: DateRange): Promise<SalesTotals>;
  dailyTotals(range: DateRange): Promise<DailySalesTotal[]>;
}
