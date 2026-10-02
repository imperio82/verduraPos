import { AppError } from "@/core/errors/app-error";
import type { DateRangeParams } from "@/core/utils/period";
import type { AccountingSummaryEntity } from "../entities/accounting-summary.entity";
import type { AccountingRepository } from "../repositories/accounting.repository";

export class GetAccountingSummaryUseCase {
	constructor(private readonly accountingRepository: AccountingRepository) {}

	execute(range: DateRangeParams): Promise<AccountingSummaryEntity> {
		if (range.from > range.to) throw new AppError("La fecha inicial es mayor que la final", "VALIDATION_ERROR");
		return this.accountingRepository.getSummary(range);
	}
}
