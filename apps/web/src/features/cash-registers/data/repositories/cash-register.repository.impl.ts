import type {
	CashRegisterEntity,
	CashSessionDetail,
	CashSessionEntity,
	CashSessionSummary,
	CloseCashSessionEntity,
	OpenCashSessionEntity,
} from "../../domain/entities/cash-register.entity";
import type { CashRegisterRepository, CashSessionsQuery } from "../../domain/repositories/cash-register.repository";
import type { CashRegisterDatasource } from "../datasource/cash-register.datasource";

export class CashRegisterRepositoryImpl implements CashRegisterRepository {
	constructor(private readonly datasource: CashRegisterDatasource) {}

	getRegisters(): Promise<CashRegisterEntity[]> {
		return this.datasource.getRegisters();
	}

	createRegister(nombre: string): Promise<CashRegisterEntity> {
		return this.datasource.createRegister(nombre);
	}

	getSessions(query: CashSessionsQuery): Promise<CashSessionSummary[]> {
		return this.datasource.getSessions(query);
	}

	getSessionDetail(id: string): Promise<CashSessionDetail> {
		return this.datasource.getSessionDetail(id);
	}

	openSession(data: OpenCashSessionEntity): Promise<CashSessionEntity> {
		return this.datasource.openSession(data);
	}

	addIncome(sessionId: string, concepto: string, monto: number): Promise<void> {
		return this.datasource.addIncome(sessionId, concepto, monto);
	}

	closeSession(sessionId: string, data: CloseCashSessionEntity): Promise<CashSessionEntity> {
		return this.datasource.closeSession(sessionId, data);
	}
}
