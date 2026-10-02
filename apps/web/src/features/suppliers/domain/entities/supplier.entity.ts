export interface SupplierEntity {
	id: string;
	nombre: string;
	telefono?: string;
	diasEntrega?: string;
	notas?: string;
	activo: boolean;
	createdAt: string;
}

export interface CreateSupplierEntity {
	nombre: string;
	telefono?: string;
	diasEntrega?: string;
	notas?: string;
}
