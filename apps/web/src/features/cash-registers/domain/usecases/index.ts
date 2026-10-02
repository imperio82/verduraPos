import { AppError } from "@/core/errors/app-error";
import type {
	CashRegisterEntity,
	CashSessionDetail,
	CashSessionEntity,
	CashSessionSummary,
	CloseCashSessionEntity,
	OpenCashSessionEntity,
} from "../entities/cash-register.entity";
import type { CashRegisterRepository, CashSessionsQuery } from "../repositories/cash-register.repository";

export class GetCashRegistersUseCase {
	constructor(private readonly repository: CashRegisterRepository) {}

	execute(): Promise<CashRegisterEntity[]> {
		return this.repository.getRegisters();
	}
}

export class CreateCashRegisterUseCase {
	constructor(private readonly repository: CashRegisterRepository) {}

	execute(nombre: string): Promise<CashRegisterEntity> {
		return this.repository.createRegister(nombre.trim());
	}
}

export class GetCashSessionsUseCase {
	constructor(private readonly repository: CashRegisterRepository) {}

	execute(query: CashSessionsQuery = {}): Promise<CashSessionSummary[]> {
		return this.repository.getSessions(query);
	}
}

export class GetCashSessionDetailUseCase {
	constructor(private readonly repository: CashRegisterRepository) {}

	execute(id: string): Promise<CashSessionDetail> {
		return this.repository.getSessionDetail(id);
	}
}

export class OpenCashSessionUseCase {
	constructor(private readonly repository: CashRegisterRepository) {}

	execute(data: OpenCashSessionEntity): Promise<CashSessionEntity> {
		if (!data.cajero.trim()) throw new AppError("Escribe el nombre del cajero", "VALIDATION_ERROR");
		if (data.base < 0) throw new AppError("La base no puede ser negativa", "VALIDATION_ERROR");
		return this.repository.openSession(data);
	}
}

export class AddCashIncomeUseCase {
	constructor(private readonly repository: CashRegisterRepository) {}

	execute(sessionId: string, concepto: string, monto: number): Promise<void> {
		if (monto <= 0) throw new AppError("El monto debe ser mayor a cero", "VALIDATION_ERROR");
		return this.repository.addIncome(sessionId, concepto, monto);
	}
}

export class CloseCashSessionUseCase {
	constructor(private readonly repository: CashRegisterRepository) {}

	execute(sessionId: string, data: CloseCashSessionEntity): Promise<CashSessionEntity> {
		return this.repository.closeSession(sessionId, {
			...data,
			conteo: data.conteo.filter((line) => line.cantidad > 0),
		});
	}
}
