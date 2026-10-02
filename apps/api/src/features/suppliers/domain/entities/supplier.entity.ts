export interface SupplierEntity {
  id: string;
  nombre: string;
  telefono?: string;
  /** Texto libre: "Lunes y jueves", "Diario"... */
  diasEntrega?: string;
  notas?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSupplierData = Omit<SupplierEntity, 'id' | 'activo' | 'createdAt' | 'updatedAt'>;
export type UpdateSupplierData = Partial<CreateSupplierData> & { activo?: boolean };
