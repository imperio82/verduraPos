export type ResponseCode =
	| "SUCCESS"
	| "CREATED"
	| "VALIDATION_ERROR"
	| "RESOURCE_NOT_FOUND"
	| "CONFLICT"
	| "BUSINESS_RULE_VIOLATION"
	| "CASH_SESSION_CLOSED"
	| "INSUFFICIENT_STOCK"
	| "INTERNAL_SERVER_ERROR";

/** Formato estándar de respuesta de la API (igual que Netvoz). */
export interface BaseApiResponse {
	status: "success" | "fail" | "error";
	statusCode: number;
	responseCode: ResponseCode;
	responseMessage: string;
	timestamp: string;
}

export interface ApiResponseWithData<T> extends BaseApiResponse {
	data: T;
}

export interface ApiErrorResponse extends BaseApiResponse {
	message: string;
	field?: string;
	details?: string[];
}
