import APIClient, { resolveUrl } from "@/core/api/api-client";
import type {
	CashRegisterEntity,
	CashSessionDetail,
	CashSessionEntity,
	CashSessionSummary,
	CloseCashSessionEntity,
	OpenCashSessionEntity,
} from "../../domain/entities/cash-register.entity";
import type { CashSessionsQuery } from "../../domain/repositories/cash-register.repository";

export const urlsCashRegisters = {
	registers: "/cash-registers",
	sessions: "/cash-registers/sessions",
	session: "/cash-registers/sessions/:id",
	incomes: "/cash-registers/sessions/:id/incomes",
	close: "/cash-registers/sessions/:id/close",
} as const;

export class CashRegisterDatasource {
	getRegisters(): Promise<CashRegisterEntity[]> {
		return APIClient.get({ url: urlsCashRegisters.registers });
	}

	createRegister(nombre: string): Promise<CashRegisterEntity> {
		return APIClient.post({ url: urlsCashRegisters.registers, data: { nombre } });
	}

	getSessions(params: CashSessionsQuery): Promise<CashSessionSummary[]> {
		return APIClient.get({ url: urlsCashRegisters.sessions, params });
	}

	getSessionDetail(id: string): Promise<CashSessionDetail> {
		return APIClient.get({ url: resolveUrl(urlsCashRegisters.session, { id }) });
	}

	openSession(data: OpenCashSessionEntity): Promise<CashSessionEntity> {
		return APIClient.post({ url: urlsCashRegisters.sessions, data });
	}

	async addIncome(id: string, concepto: string, monto: number): Promise<void> {
		await APIClient.post({ url: resolveUrl(urlsCashRegisters.incomes, { id }), data: { concepto, monto } });
	}

	closeSession(id: string, data: CloseCashSessionEntity): Promise<CashSessionEntity> {
		return APIClient.post({ url: resolveUrl(urlsCashRegisters.close, { id }), data });
	}
}
