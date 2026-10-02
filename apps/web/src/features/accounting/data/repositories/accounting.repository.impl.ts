import type { DateRangeParams } from "@/core/utils/period";
import type { AccountingSummaryEntity } from "../../domain/entities/accounting-summary.entity";
import type { AccountingRepository } from "../../domain/repositories/accounting.repository";
import type { AccountingDatasource } from "../datasource/accounting.datasource";

export class AccountingRepositoryImpl implements AccountingRepository {
	constructor(private readonly accountingDatasource: AccountingDatasource) {}

	getSummary(range: DateRangeParams): Promise<AccountingSummaryEntity> {
		return this.accountingDatasource.getSummary(range);
	}
}
