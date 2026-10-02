import { Global, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import type { MongoMemoryServer } from 'mongodb-memory-server';
import { envs } from '../config/envs';
import { COUNTER_MODEL, CounterSchema, SequenceService } from './sequence.service';

let memoryServer: MongoMemoryServer | undefined;

export const databaseState = { inMemory: false };

/**
 * Resuelve la URL de Mongo. En desarrollo, si no hay MONGO_URL configurada,
 * levanta una instancia en memoria para poder trabajar sin instalar Mongo.
 */
export async function resolveMongoUri(): Promise<string> {
  if (envs.mongoUrl) return envs.mongoUrl;
  if (envs.isProduction) throw new Error('MONGO_URL es obligatorio en producción');

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer ??= await MongoMemoryServer.create();
  databaseState.inMemory = true;
  return memoryServer.getUri();
}

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = await resolveMongoUri();
        new Logger('Database').log(databaseState.inMemory ? 'MongoDB en memoria (desarrollo)' : 'Conectado a MongoDB');
        return { uri, dbName: envs.mongoDbName };
      },
    }),
    MongooseModule.forFeature([{ name: COUNTER_MODEL, schema: CounterSchema }]),
  ],
  providers: [SequenceService],
  exports: [SequenceService],
})
export class DatabaseModule implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await memoryServer?.stop();
  }
}
