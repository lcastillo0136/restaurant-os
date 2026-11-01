import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { getRequestId } from './request-context.middleware.js';

export type HttpLogEntry = Readonly<{
  event: 'http_request_completed';
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
}>;

export function createHttpLogEntry(
  request: Pick<Request, 'method' | 'path'>,
  response: Response,
  startedAt: number,
): HttpLogEntry {
  return {
    event: 'http_request_completed',
    requestId: getRequestId(response),
    method: request.method,
    path: request.path,
    statusCode: response.statusCode,
    durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
  };
}

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const startedAt = performance.now();
    const log = (): void => {
      const level = response.statusCode >= 400 ? 'warn' : 'log';
      this.logger[level](JSON.stringify(createHttpLogEntry(request, response, startedAt)));
    };

    // El filtro global puede definir el estado después de que el observable propaga
    // una excepción. `finish` ocurre cuando Express ya envió la respuesta final.
    response.once('finish', log);
    return next.handle();
  }
}
