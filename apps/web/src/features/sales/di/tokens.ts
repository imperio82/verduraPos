export const TOKENS_SALES = {
	SaleDatasource: Symbol("SaleDatasource"),
	SaleRepository: Symbol("SaleRepository"),
	CheckoutSaleUseCase: Symbol("CheckoutSaleUseCase"),
	GetNextSaleNumberUseCase: Symbol("GetNextSaleNumberUseCase"),
	GetDailySalesUseCase: Symbol("GetDailySalesUseCase"),
	GetSessionSalesUseCase: Symbol("GetSessionSalesUseCase"),
} as const;
