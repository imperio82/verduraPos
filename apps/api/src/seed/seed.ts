import 'reflect-metadata';
import { envs } from '../core/config/envs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { seedDevData } from './dev-seed';

process.env.TZ = envs.timezone;

/** Carga los datos de ejemplo en la base configurada en MONGO_URL (solo si está vacía). */
async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  await seedDevData(app);
  await app.close();
  console.log('Seed completado');
}

void run();
