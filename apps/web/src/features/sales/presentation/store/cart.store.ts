"use client";

import { create } from "zustand";
import type { PaymentMethod } from "@/features/cash-registers/domain/entities/cash-register.entity";
import { type CartLine, removeLine, type SaleType, upsertLine } from "../../domain/entities/sale.entity";

interface CartState {
	mode: SaleType;
	lines: CartLine[];
	metodoPago: PaymentMethod;
	/** Monto escrito en modo "venta total". */
	totalAmount: number;
	setMode: (mode: SaleType) => void;
	upsert: (line: CartLine) => void;
	remove: (productId: string) => void;
	setMetodoPago: (metodo: PaymentMethod) => void;
	setTotalAmount: (amount: number) => void;
	reset: () => void;
}

const initial = { lines: [], metodoPago: "efectivo" as const, totalAmount: 0 };

/** Estado de la venta en curso (solo UI; las reglas viven en domain/). */
export const useCartStore = create<CartState>()((set) => ({
	...initial,
	mode: "productos",
	setMode: (mode) => set({ mode }),
	upsert: (line) => set((state) => ({ lines: upsertLine(state.lines, line) })),
	remove: (productId) => set((state) => ({ lines: removeLine(state.lines, productId) })),
	setMetodoPago: (metodoPago) => set({ metodoPago }),
	setTotalAmount: (totalAmount) => set({ totalAmount }),
	reset: () => set(initial),
}));
