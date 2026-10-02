import type { PaymentMethod } from '@/core/constants/collections';
import type { ProductUnit } from '@/features/products/domain/entities/product.entity';

/** "productos": se registra cada producto. "total": solo el valor total cobrado. */
export type SaleType = 'productos' | 'total';

export interface SaleItem {
  productId: string;
  nombre: string;
  unidad: ProductUnit;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export interface SaleEntity {
  id: string;
  numero: number;
  cashSessionId: string;
  cajaNombre: string;
  cajero: string;
  tipo: SaleType;
  items: SaleItem[];
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: PaymentMethod;
  nota?: string;
  createdAt: Date;
}

export type NewSale = Omit<SaleEntity, 'id' | 'numero' | 'createdAt'>;

export interface SalesTotals {
  count: number;
  total: number;
  porMetodo: Record<PaymentMethod, number>;
}

export interface DailySalesTotal {
  /** YYYY-MM-DD */
  fecha: string;
  total: number;
}

export interface SaleFilters {
  cashSessionId?: string;
  from?: Date;
  to?: Date;
}
