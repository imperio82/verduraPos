import type { ProductUnit } from '@/features/products/domain/entities/product.entity';

export interface RecountItem {
  productId: string;
  nombre: string;
  unidad: ProductUnit;
  /** Lo que decía el sistema antes de contar. */
  sistema: number;
  contado: number;
  /** contado − sistema */
  diferencia: number;
}

/** Reconteo físico: el stock queda igual a lo contado. */
export interface RecountEntity {
  id: string;
  items: RecountItem[];
  nota?: string;
  /** Caja del turno en que se hizo. Los registros antiguos pueden no tenerla. */
  cashSessionId?: string;
  createdAt: Date;
}

export type NewRecount = Omit<RecountEntity, 'id' | 'createdAt'>;

/** Producto dañado: sale del stock y se registra como pérdida al costo. */
export interface DamageEntity {
  id: string;
  productId: string;
  nombre: string;
  unidad: ProductUnit;
  cantidad: number;
  /** cantidad × precio de compra */
  costo: number;
  motivo?: string;
  /** Caja del turno en que se registró. Los registros antiguos pueden no tenerla. */
  cashSessionId?: string;
  createdAt: Date;
}

export type NewDamage = Omit<DamageEntity, 'id' | 'createdAt'>;

export interface DamageSummary {
  desde: string;
  hasta: string;
  /** Total por unidad: { kg: 6.2, und: 3 } */
  cantidadPorUnidad: Partial<Record<ProductUnit, number>>;
  costoTotal: number;
  items: DamageEntity[];
}
