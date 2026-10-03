import { Badge } from "@/core/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/ui/table";
import { formatMoney, formatQuantity, formatTime } from "@/core/utils/format";
import { PAYMENT_METHOD_LABELS } from "@/features/cash-registers/domain/entities/cash-register.entity";
import type { SaleEntity } from "../../domain/entities/sale.entity";

const saleNumber = (numero: number) => `#${String(numero).padStart(4, "0")}`;

const saleDetail = (sale: SaleEntity): string =>
	sale.tipo === "total" || sale.items.length === 0
		? (sale.nota ?? "Venta por total")
		: sale.items.map((item) => `${item.nombre} ${formatQuantity(item.cantidad, item.unidad)}`).join(", ");

/** Tabla de ventas. `showRegister` agrega la columna de caja/cajero (cuando se mezclan cajas). */
export function SalesTable({ sales, showRegister = false }: { sales: SaleEntity[]; showRegister?: boolean }) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Venta</TableHead>
					<TableHead>Hora</TableHead>
					<TableHead>Detalle</TableHead>
					{showRegister && <TableHead>Caja</TableHead>}
					<TableHead>Método</TableHead>
					<TableHead className="text-right">Total</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sales.map((sale) => (
					<TableRow key={sale.id}>
						<TableCell className="tabular font-bold">{saleNumber(sale.numero)}</TableCell>
						<TableCell className="tabular whitespace-nowrap">{formatTime(sale.createdAt)}</TableCell>
						<TableCell className="max-w-[320px] truncate" title={saleDetail(sale)}>
							{saleDetail(sale)}
						</TableCell>
						{showRegister && (
							<TableCell>
								<div className="font-semibold">{sale.cajaNombre}</div>
								<div className="text-sm text-muted-foreground">{sale.cajero}</div>
							</TableCell>
						)}
						<TableCell>
							<Badge variant="outline">{PAYMENT_METHOD_LABELS[sale.metodoPago]}</Badge>
						</TableCell>
						<TableCell className="tabular text-right font-extrabold">{formatMoney(sale.total)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
