import { NestFactory } from '@nestjs/core';
import { loadDatabaseEnvironment } from './database/database-environment.js';
import { AppModule } from './app.module.js';
import { resolveApiEnvironment } from './environment.js';

async function bootstrap(): Promise<void> {
  loadDatabaseEnvironment();
  const environment = resolveApiEnvironment();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  if (environment.allowedOrigins.length > 0) {
    app.enableCors({
      origin: environment.allowedOrigins,
      credentials: false,
      methods: ['GET', 'HEAD', 'OPTIONS'],
    });
  }

  await app.listen(environment.port, environment.host);
}

void bootstrap().catch((error: unknown) => {
  const detail = error instanceof Error ? error.message : 'error de configuración desconocido';
  console.error(`No se pudo iniciar la API: ${detail}`);
  process.exitCode = 1;
});
