import APIClient from "@/core/api/api-client";
import type { DateRangeParams } from "@/core/utils/period";
import type { AccountingSummaryEntity } from "../../domain/entities/accounting-summary.entity";

export const urlsAccounting = {
	summary: "/accounting/summary",
} as const;

export class AccountingDatasource {
	getSummary(params: DateRangeParams): Promise<AccountingSummaryEntity> {
		return APIClient.get({ url: urlsAccounting.summary, params });
	}
}
