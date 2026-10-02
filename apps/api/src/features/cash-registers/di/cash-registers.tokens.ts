// ===== DEPENDENCY TOKENS =====
export const CASH_REGISTER_TOKENS = {
  CashRegisterDataSource: Symbol.for('CashRegisterDataSource'),
  CashRegisterRepository: Symbol.for('CashRegisterRepository'),
  CashSessionActivityReader: Symbol.for('CashSessionActivityReader'),
} as const;
