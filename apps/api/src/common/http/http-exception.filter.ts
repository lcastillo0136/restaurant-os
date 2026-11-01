import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createApiErrorBody, ValidationDetail } from './api-error.js';
import { getRequestId } from './request-context.middleware.js';

type ValidationResponse = Readonly<{
  code?: unknown;
  details?: unknown;
}>;

function validationDetails(exception: HttpException): ValidationDetail[] | undefined {
  const response = exception.getResponse();
  if (!response || typeof response !== 'object') return undefined;
  const candidate = response as ValidationResponse;
  if (candidate.code !== 'VALIDATION_FAILED' || !Array.isArray(candidate.details)) return undefined;
  return candidate.details.filter((detail): detail is ValidationDetail => (
    typeof detail === 'object'
    && detail !== null
    && typeof (detail as ValidationDetail).field === 'string'
    && Array.isArray((detail as ValidationDetail).constraints)
  ));
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException ? exception.getStatus() : 500;
    const requestId = getRequestId(response);
    const path = request.path;
    const details = isHttpException ? validationDetails(exception) : undefined;

    if (!isHttpException) {
      this.logger.error(JSON.stringify({
        event: 'unhandled_request_error',
        requestId,
        method: request.method,
        path,
        statusCode,
        errorType: exception instanceof Error ? exception.name : 'UnknownError',
      }));
    }

    response.status(statusCode).json(createApiErrorBody(statusCode, requestId, path, details));
  }
}
