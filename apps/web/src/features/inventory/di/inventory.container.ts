import { container } from "@/core/di/di-container";
import { InventoryDatasource } from "../data/datasource/inventory.datasource";
import { InventoryRepositoryImpl } from "../data/repositories/inventory.repository.impl";
import {
	GetDamageSummaryUseCase,
	GetLastRecountUseCase,
	RegisterDamageUseCase,
	RegisterRecountUseCase,
} from "../domain/usecases";
import { TOKENS_INVENTORY as T } from "./tokens";

export function inventoryConfigureContainer(): void {
	container.registerClass(T.InventoryDatasource, InventoryDatasource);
	container.registerClass(T.InventoryRepository, InventoryRepositoryImpl, [T.InventoryDatasource]);

	const repo = [T.InventoryRepository];
	container.registerClass(T.GetLastRecountUseCase, GetLastRecountUseCase, repo);
	container.registerClass(T.RegisterRecountUseCase, RegisterRecountUseCase, repo);
	container.registerClass(T.GetDamageSummaryUseCase, GetDamageSummaryUseCase, repo);
	container.registerClass(T.RegisterDamageUseCase, RegisterDamageUseCase, repo);
}
