"use client";

import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { SearchInput } from "@/core/components/search-input";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Card } from "@/core/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/ui/table";
import { formatMoney, formatQuantity } from "@/core/utils/format";
import {
	CATEGORY_META,
	filterProducts,
	isLowStock,
	needsRecount,
	type ProductEntity,
} from "@/features/products/domain/entities/product.entity";
import { ProductAvatar } from "@/features/products/presentation/components/product-avatar";
import { ProductFormDialog } from "@/features/products/presentation/components/product-form-dialog";
import { useProducts } from "@/features/products/presentation/hooks/use-products";

export function StockTable() {
	const { data: products = [] } = useProducts();
	const [search, setSearch] = useState("");
	const [editing, setEditing] = useState<ProductEntity | null>(null);
	const [formOpen, setFormOpen] = useState(false);
	const visible = useMemo(() => filterProducts(products, { search }), [products, search]);
	const lowCount = products.filter(isLowStock).length;

	const openForm = (product: ProductEntity | null) => {
		setEditing(product);
		setFormOpen(true);
	};

	return (
		<Card className="p-0">
			<div className="flex flex-wrap items-center gap-3 p-5 pb-0">
				<SearchInput placeholder="Buscar producto…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
				{lowCount > 0 && <Badge variant="warning">{lowCount} con poco stock</Badge>}
				<Button variant="dark" onClick={() => openForm(null)}>
					<PlusIcon /> Producto
				</Button>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Producto</TableHead>
						<TableHead>Categoría</TableHead>
						<TableHead className="text-right">Stock</TableHead>
						<TableHead className="text-right">Costo</TableHead>
						<TableHead className="text-right">%</TableHead>
						<TableHead className="text-right">Venta</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{visible.map((p) => (
						<TableRow key={p.id}>
							<TableCell>
								<span className="flex items-center gap-2.5 font-bold">
									<ProductAvatar color={p.color} className="size-7" />
									{p.nombre}
								</span>
							</TableCell>
							<TableCell className="text-muted-foreground">{CATEGORY_META[p.categoria].label}</TableCell>
							<TableCell className={cn("tabular text-right font-bold", isLowStock(p) && "text-warning", needsRecount(p) && "text-destructive")}>
								{formatQuantity(p.stock, p.unidad)}
							</TableCell>
							<TableCell className="tabular text-right">{formatMoney(p.precioCompra)}</TableCell>
							<TableCell className="tabular text-right">{p.porcentajeGanancia} %</TableCell>
							<TableCell className="tabular text-right font-extrabold">{formatMoney(p.precioVenta)}</TableCell>
							<TableCell className="text-right">
								<Button variant="ghost" size="sm" onClick={() => openForm(p)}>
									Editar
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<ProductFormDialog product={editing} open={formOpen} onOpenChange={setFormOpen} />
		</Card>
	);
}
