import { isAxiosError } from "axios";
import type { ApiErrorResponse, ResponseCode } from "../api/base-api-response";

/** Error normalizado para la capa de presentación. */
export class AppError extends Error {
	constructor(
		message: string,
		readonly responseCode: ResponseCode = "INTERNAL_SERVER_ERROR",
		readonly statusCode?: number,
		readonly field?: string,
	) {
		super(message);
		this.name = "AppError";
	}

	static fromError(error: unknown): AppError {
		if (error instanceof AppError) return error;

		if (isAxiosError<ApiErrorResponse>(error)) {
			const body = error.response?.data;
			if (body?.message) {
				return new AppError(body.message, body.responseCode, body.statusCode, body.field);
			}
			if (error.code === "ERR_NETWORK") {
				return new AppError("No hay conexión con el servidor", "INTERNAL_SERVER_ERROR");
			}
		}

		return new AppError(error instanceof Error ? error.message : "Ocurrió un error inesperado");
	}
}
