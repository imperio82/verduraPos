import type {
	CashRegisterEntity,
	CashSessionDetail,
	CashSessionEntity,
	CashSessionStatus,
	CashSessionSummary,
	CloseCashSessionEntity,
	OpenCashSessionEntity,
} from "../entities/cash-register.entity";

export interface CashSessionsQuery {
	estado?: CashSessionStatus;
	dias?: number;
}

export interface CashRegisterRepository {
	getRegisters(): Promise<CashRegisterEntity[]>;
	createRegister(nombre: string): Promise<CashRegisterEntity>;
	getSessions(query: CashSessionsQuery): Promise<CashSessionSummary[]>;
	getSessionDetail(id: string): Promise<CashSessionDetail>;
	openSession(data: OpenCashSessionEntity): Promise<CashSessionEntity>;
	addIncome(sessionId: string, concepto: string, monto: number): Promise<void>;
	closeSession(sessionId: string, data: CloseCashSessionEntity): Promise<CashSessionEntity>;
}
