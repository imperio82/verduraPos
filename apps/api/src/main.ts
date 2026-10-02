import 'reflect-metadata';
import { envs } from './core/config/envs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { databaseState } from './core/database/database.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { seedDevData } from './seed/dev-seed';

process.env.TZ = envs.timezone;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.enableCors({ origin: envs.allowedOrigins, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();

  await app.init();

  // Base en memoria: arranca con datos de ejemplo para poder probar el POS.
  if (databaseState.inMemory) {
    await seedDevData(app);
    logger.log('Datos de ejemplo cargados');
  }

  await app.listen(envs.port);
  logger.log(`API lista en http://localhost:${envs.port}/api`);
}

void bootstrap();
