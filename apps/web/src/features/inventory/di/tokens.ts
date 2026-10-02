export const TOKENS_INVENTORY = {
	InventoryDatasource: Symbol("InventoryDatasource"),
	InventoryRepository: Symbol("InventoryRepository"),
	GetLastRecountUseCase: Symbol("GetLastRecountUseCase"),
	RegisterRecountUseCase: Symbol("RegisterRecountUseCase"),
	GetDamageSummaryUseCase: Symbol("GetDamageSummaryUseCase"),
	RegisterDamageUseCase: Symbol("RegisterDamageUseCase"),
} as const;
