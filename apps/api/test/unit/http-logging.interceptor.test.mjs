import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { BadRequestException } from '@nestjs/common';
import test from 'node:test';
import { throwError } from 'rxjs';
import {
  createHttpLogEntry,
  HttpLoggingInterceptor,
} from '../../dist/common/http/http-logging.interceptor.js';
import { HttpExceptionFilter } from '../../dist/common/http/http-exception.filter.js';

test('el registro HTTP solo contiene metadatos seguros de la solicitud', () => {
  const request = {
    method: 'POST',
    path: '/api/v1/system/health',
    headers: { authorization: 'Bearer private-token' },
    body: { password: 'private-password' },
  };
  const response = { locals: { requestId: 'request-safe-id' }, statusCode: 200 };
  const entry = createHttpLogEntry(request, response, performance.now());

  assert.deepEqual(Object.keys(entry).sort(), ['durationMs', 'event', 'method', 'path', 'requestId', 'statusCode']);
  assert.equal(JSON.stringify(entry).includes('private-token'), false);
  assert.equal(JSON.stringify(entry).includes('private-password'), false);
});

function responseWithRequestId(requestId) {
  return Object.assign(new EventEmitter(), {
    locals: { requestId },
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json() {
      return this;
    },
  });
}

function hostFor(request, response) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  };
}

function logExceptionAfterFinalResponse(exception, expectedStatusCode) {
  const request = { method: 'GET', path: '/api/v1/system/health' };
  const response = responseWithRequestId('request-final-status-id');
  const context = hostFor(request, response);
  const entries = [];
  const interceptor = new HttpLoggingInterceptor();
  interceptor.logger = {
    log: (entry) => entries.push({ level: 'log', entry: JSON.parse(entry) }),
    warn: (entry) => entries.push({ level: 'warn', entry: JSON.parse(entry) }),
  };

  interceptor.intercept(context, {
    handle: () => throwError(() => exception),
  }).subscribe({
    error: (error) => {
      new HttpExceptionFilter().catch(error, hostFor(request, response));
      response.emit('finish');
    },
  });

  assert.equal(response.statusCode, expectedStatusCode);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].level, 'warn');
  assert.deepEqual(entries[0].entry, {
    event: 'http_request_completed',
    requestId: 'request-final-status-id',
    method: 'GET',
    path: '/api/v1/system/health',
    statusCode: expectedStatusCode,
    durationMs: entries[0].entry.durationMs,
  });
  assert.equal(Number.isInteger(entries[0].entry.durationMs), true);
  assert.equal(entries[0].entry.durationMs >= 0, true);
}

test('registra una excepción inesperada como HTTP 500 tras la respuesta final', () => {
  logExceptionAfterFinalResponse(new Error('detalle interno no publicable'), 500);
});

test('registra una excepción HTTP como 400 tras la respuesta final', () => {
  logExceptionAfterFinalResponse(new BadRequestException('detalle interno no publicable'), 400);
});
