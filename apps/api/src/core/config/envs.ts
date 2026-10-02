// Carga .env (Node >= 20.12) antes de leer cualquier variable.
try {
  process.loadEnvFile();
} catch {
  // Sin archivo .env: se usan las variables del entorno.
}

const toList =(value: string | undefined, fallback: string[]): string[] =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : fallback;

export const envs = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  timezone: process.env.TZ ?? 'America/Bogota',
  mongoUrl: process.env.MONGO_URL ?? '',
  mongoDbName: process.env.MONGO_DB_NAME ?? 'verdura_pos',
  allowedOrigins: toList(process.env.ALLOWED_ORIGINS, ['http://localhost:3000']),
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
};
