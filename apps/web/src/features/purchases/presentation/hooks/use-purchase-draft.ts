"use client";

import { useCallback, useMemo, useState } from "react";
import { useProducts } from "@/features/products/presentation/hooks/use-products";
import { useSuppliers } from "@/features/suppliers/presentation/hooks/use-suppliers";
import { draftFromLastPurchase, type PurchaseDraftLine } from "../../domain/entities/purchase.entity";
import { useLastPurchase } from "./use-purchases";

type LinesUpdate = PurchaseDraftLine[] | ((lines: PurchaseDraftLine[]) => PurchaseDraftLine[]);

/**
 * Borrador de compra/pedido: al elegir proveedor se precarga su última compra.
 * Las ediciones del usuario se guardan con la "llave" del proveedor; si cambia
 * el proveedor, el borrador vuelve a derivarse de su última compra (sin efectos).
 */
export function usePurchaseDraft() {
	const { data: suppliers = [] } = useSuppliers();
	const { data: products = [] } = useProducts();
	const [selectedSupplier, setSupplierId] = useState<string>();
	const supplierId = selectedSupplier ?? suppliers[0]?.id;
	const { data: lastPurchase } = useLastPurchase(supplierId);

	const draftKey = `${supplierId ?? ""}:${lastPurchase?.id ?? "none"}`;
	const baseLines = useMemo(() => draftFromLastPurchase(lastPurchase ?? null, products), [lastPurchase, products]);
	const [edited, setEdited] = useState<{ key: string; lines: PurchaseDraftLine[] } | null>(null);
	const lines = edited?.key === draftKey ? edited.lines : baseLines;

	const setLines = useCallback(
		(update: LinesUpdate) =>
			setEdited((prev) => {
				const current = prev?.key === draftKey ? prev.lines : baseLines;
				return { key: draftKey, lines: typeof update === "function" ? update(current) : update };
			}),
		[draftKey, baseLines],
	);

	const updateLine = useCallback(
		(productId: string, patch: Partial<PurchaseDraftLine>) =>
			setLines((current) => current.map((l) => (l.productId === productId ? { ...l, ...patch } : l))),
		[setLines],
	);

	return {
		suppliers,
		products,
		supplierId,
		setSupplierId,
		lastPurchase: lastPurchase ?? null,
		draftKey,
		lines,
		setLines,
		updateLine,
		resetDraft: () => setEdited(null),
	};
}
