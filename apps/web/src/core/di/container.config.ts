import { accountingConfigureContainer } from "@/features/accounting/di/accounting.container";
import { cashRegistersConfigureContainer } from "@/features/cash-registers/di/cash-registers.container";
import { expensesConfigureContainer } from "@/features/expenses/di/expenses.container";
import { inventoryConfigureContainer } from "@/features/inventory/di/inventory.container";
import { productsConfigureContainer } from "@/features/products/di/products.container";
import { purchasesConfigureContainer } from "@/features/purchases/di/purchases.container";
import { salesConfigureContainer } from "@/features/sales/di/sales.container";
import { savingsConfigureContainer } from "@/features/savings/di/savings.container";
import { suppliersConfigureContainer } from "@/features/suppliers/di/suppliers.container";

let configured = false;

/** Registra las dependencias de todas las features (una sola vez). */
export function configureContainer(): void {
	if (configured) return;
	productsConfigureContainer();
	suppliersConfigureContainer();
	cashRegistersConfigureContainer();
	salesConfigureContainer();
	expensesConfigureContainer();
	savingsConfigureContainer();
	accountingConfigureContainer();
	purchasesConfigureContainer();
	inventoryConfigureContainer();
	configured = true;
}
