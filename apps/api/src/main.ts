import 'reflect-metadata';
import { readFileSync } from 'node:fs';
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
import { corsOptions } from './common/http/cors-policy.js';
import { loadDatabaseEnvironment } from './database/database-environment.js';
import { AppModule } from './app.module.js';
import { resolveApiEnvironment, resolveTransportSecurityEnvironment, resolveWebsocketEnvironment } from './environment.js';
import { RestaurantSocketIoAdapter } from './realtime/restaurant-socket-io.adapter.js';

async function bootstrap(): Promise<void> {
  loadDatabaseEnvironment();
  const environment = resolveApiEnvironment();
  const transportSecurity = resolveTransportSecurityEnvironment();
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    httpsOptions: transportSecurity.enabled
      ? {
        key: readFileSync(transportSecurity.keyPath!),
        cert: readFileSync(transportSecurity.certificatePath!),
      }
      : undefined,
  });
  app.useWebSocketAdapter(new RestaurantSocketIoAdapter(app, resolveWebsocketEnvironment()));
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.use(requestContextMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(json({ limit: environment.bodyLimitBytes }));
  app.use(bodyLimitExceptionMiddleware);
  app.useGlobalPipes(createValidationPipe() as ValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  const cors = corsOptions(environment.allowedOrigins);
  if (cors) app.enableCors(cors);

  await app.listen(environment.port, environment.host);
  new Logger('Bootstrap').log(JSON.stringify({
    event: 'api_started',
    host: environment.host,
    port: environment.port,
    executionMode: environment.executionMode,
    transportSecurity: transportSecurity.enabled ? 'tls' : 'http-loopback-only',
  }));
}

void bootstrap().catch((error: unknown) => {
  const detail = error instanceof Error ? error.message : 'error de configuración desconocido';
  console.error(`No se pudo iniciar la API: ${detail}`);
  process.exitCode = 1;
});
