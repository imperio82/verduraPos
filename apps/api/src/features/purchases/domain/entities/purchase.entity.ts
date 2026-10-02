import type { ProductUnit } from '@/features/products/domain/entities/product.entity';

/**
 * Ciclo de una compra: se registra "por llegar" (no toca el stock) y cuando la
 * mercancía llega se revisa producto por producto; ahí queda "recibida".
 */
export const PURCHASE_STATUSES = ['por_llegar', 'recibida', 'cancelada'] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export const PURCHASE_ITEM_STATUSES = ['bien', 'falto', 'malo'] as const;
export type PurchaseItemStatus = (typeof PURCHASE_ITEM_STATUSES)[number];

export interface PurchaseItem {
  productId: string;
  nombre: string;
  unidad: ProductUnit;
  /** Cantidad comprada (la que se espera recibir). */
  cantidad: number;
  precioCompra: number;
  porcentajeGanancia: number;
  /** Precio de venta resultante; se aplica al producto al recibir. */
  precioVenta: number;
  /** cantidad × precioCompra */
  subtotal: number;
  // ---- Se llenan al revisar la llegada ----
  cantidadRecibida?: number;
  /** Parte de lo recibido que llegó en mal estado (no suma al stock). */
  cantidadMala?: number;
  estado?: PurchaseItemStatus;
}

export interface PurchaseEntity {
  id: string;
  /** Consecutivo visible: C-001, C-002... */
  codigo: string;
  supplierId: string;
  proveedorNombre: string;
  numeroFactura?: string;
  fechaFactura?: Date;
  /** Cuándo se espera que llegue. */
  fechaEntrega: Date;
  porcentajeGananciaGeneral: number;
  items: PurchaseItem[];
  /** Valor de lo comprado. */
  total: number;
  /** Valor de lo que entró en buen estado (se llena al recibir). */
  totalRecibido?: number;
  estado: PurchaseStatus;
  nota?: string;
  notaLlegada?: string;
  recibidaEn?: Date;
  createdAt: Date;
}

export type NewPurchase = Omit<
  PurchaseEntity,
  'id' | 'codigo' | 'estado' | 'createdAt' | 'totalRecibido' | 'notaLlegada' | 'recibidaEn'
>;

export interface ReceivedPurchaseData {
  items: PurchaseItem[];
  totalRecibido: number;
  numeroFactura?: string;
  fechaFactura?: Date;
  notaLlegada?: string;
}

export const purchaseTotal = (items: Pick<PurchaseItem, 'subtotal'>[]): number =>
  items.reduce((sum, item) => sum + item.subtotal, 0);

/** Lo que entra al stock de una línea: lo recibido menos lo que llegó malo. */
export const goodQuantity = (item: Pick<PurchaseItem, 'cantidadRecibida' | 'cantidadMala'>): number =>
  Math.max(0, (item.cantidadRecibida ?? 0) - (item.cantidadMala ?? 0));
