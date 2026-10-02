export const GLOBAL_CONFIG = {
	appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Verdura POS",
	apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
} as const;
