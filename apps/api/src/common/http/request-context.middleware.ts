import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { createApiErrorBody } from './api-error.js';

export const requestIdHeader = 'x-request-id';

export function getRequestId(response: Response): string {
  const requestId = response.locals.requestId;
  return typeof requestId === 'string' ? requestId : randomUUID();
}

export function requestContextMiddleware(_request: Request, response: Response, next: NextFunction): void {
  const requestId = randomUUID();
  response.locals.requestId = requestId;
  response.setHeader(requestIdHeader, requestId);
  next();
}

export function securityHeadersMiddleware(_request: Request, response: Response, next: NextFunction): void {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
  next();
}

export function bodyLimitExceptionMiddleware(
  error: unknown,
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const candidate = error as { status?: unknown; type?: unknown };
  if (candidate?.status === 413 || candidate?.type === 'entity.too.large') {
    response.status(413).json(createApiErrorBody(413, getRequestId(response), request.path));
    return;
  }
  next(error);
}
