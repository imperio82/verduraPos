export const TOKENS_PURCHASES = {
	PurchaseDatasource: Symbol("PurchaseDatasource"),
	PurchaseRepository: Symbol("PurchaseRepository"),
	GetPurchasesUseCase: Symbol("GetPurchasesUseCase"),
	GetPurchaseUseCase: Symbol("GetPurchaseUseCase"),
	GetLastPurchaseUseCase: Symbol("GetLastPurchaseUseCase"),
	CreatePurchaseUseCase: Symbol("CreatePurchaseUseCase"),
	ReceivePurchaseUseCase: Symbol("ReceivePurchaseUseCase"),
	CancelPurchaseUseCase: Symbol("CancelPurchaseUseCase"),
} as const;
