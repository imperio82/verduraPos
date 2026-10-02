import type { DateRangeParams } from "@/core/utils/period";
import type { AccountingSummaryEntity } from "../entities/accounting-summary.entity";

export interface AccountingRepository {
	getSummary(range: DateRangeParams): Promise<AccountingSummaryEntity>;
}
