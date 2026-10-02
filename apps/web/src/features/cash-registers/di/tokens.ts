export const TOKENS_CASH_REGISTERS = {
	CashRegisterDatasource: Symbol("CashRegisterDatasource"),
	CashRegisterRepository: Symbol("CashRegisterRepository"),
	GetCashRegistersUseCase: Symbol("GetCashRegistersUseCase"),
	CreateCashRegisterUseCase: Symbol("CreateCashRegisterUseCase"),
	GetCashSessionsUseCase: Symbol("GetCashSessionsUseCase"),
	GetCashSessionDetailUseCase: Symbol("GetCashSessionDetailUseCase"),
	OpenCashSessionUseCase: Symbol("OpenCashSessionUseCase"),
	AddCashIncomeUseCase: Symbol("AddCashIncomeUseCase"),
	CloseCashSessionUseCase: Symbol("CloseCashSessionUseCase"),
} as const;
