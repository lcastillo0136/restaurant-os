import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { HttpExceptionFilter } from './common/http/http-exception.filter.js';
import { HttpLoggingInterceptor } from './common/http/http-logging.interceptor.js';
import {
  bodyLimitExceptionMiddleware,
  requestContextMiddleware,
  securityHeadersMiddleware,
} from './common/http/request-context.middleware.js';
import { createValidationPipe } from './common/http/validation.pipe.js';
import { loadDatabaseEnvironment } from './database/database-environment.js';
import { AppModule } from './app.module.js';
import { resolveApiEnvironment } from './environment.js';

async function bootstrap(): Promise<void> {
  loadDatabaseEnvironment();
  const environment = resolveApiEnvironment();
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.use(requestContextMiddleware);
  app.use(json({ limit: environment.bodyLimitBytes }));
  app.use(bodyLimitExceptionMiddleware);
  app.use(securityHeadersMiddleware);
  app.useGlobalPipes(createValidationPipe() as ValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  if (environment.allowedOrigins.length > 0) {
    app.enableCors({
      origin: environment.allowedOrigins,
      credentials: false,
      methods: ['GET', 'HEAD', 'OPTIONS'],
    });
  }

  await app.listen(environment.port, environment.host);
  new Logger('Bootstrap').log(JSON.stringify({
    event: 'api_started',
    host: environment.host,
    port: environment.port,
    executionMode: environment.executionMode,
  }));
}

void bootstrap().catch((error: unknown) => {
  const detail = error instanceof Error ? error.message : 'error de configuración desconocido';
  console.error(`No se pudo iniciar la API: ${detail}`);
  process.exitCode = 1;
});
