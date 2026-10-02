import axios, { type AxiosRequestConfig } from "axios";
import { GLOBAL_CONFIG } from "@/core/config/global-config";
import { AppError } from "@/core/errors/app-error";
import type { ApiResponseWithData } from "./base-api-response";

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 30_000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

// Todas las respuestas vienen envueltas en { status, responseCode, data }:
// aquí se desenvuelven para que los datasources reciban solo `data`,
// y los errores se normalizan a AppError.
axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(AppError.fromError(error)),
);

/** Reemplaza `:param` en la URL. */
export const resolveUrl = (template: string, params: Record<string, string>): string =>
	Object.entries(params).reduce((url, [key, value]) => url.replace(`:${key}`, encodeURIComponent(value)), template);

class APIClient {
	get<T>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}

	post<T>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}

	patch<T>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PATCH" });
	}

	delete<T>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}

	private async request<T>(config: AxiosRequestConfig): Promise<T> {
		const response = await axiosInstance.request<ApiResponseWithData<T>>(config);
		return response.data.data;
	}
}

const apiClient = new APIClient();

export default apiClient;
