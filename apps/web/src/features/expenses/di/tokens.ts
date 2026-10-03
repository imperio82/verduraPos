export const TOKENS_EXPENSES = {
	ExpenseDatasource: Symbol("ExpenseDatasource"),
	ExpenseRepository: Symbol("ExpenseRepository"),
	RegisterExpenseUseCase: Symbol("RegisterExpenseUseCase"),
	GetDailyExpensesUseCase: Symbol("GetDailyExpensesUseCase"),
} as const;
