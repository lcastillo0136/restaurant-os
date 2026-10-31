import assert from 'node:assert/strict';
import { NotFoundException } from '@nestjs/common';
import test from 'node:test';
import { HttpExceptionFilter } from '../../dist/common/http/http-exception.filter.js';

function responseWithRequestId(requestId) {
  return {
    locals: { requestId },
    statusCode: undefined,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function hostFor(request, response) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  };
}

test('normaliza errores internos sin filtrar mensajes sensibles', () => {
  const response = responseWithRequestId('safe-request-id');
  const connectionDescription = ['postgresql', '://', 'restaurant_app', ':private-secret', '@127.0.0.1/restaurant_dev'].join('');
  new HttpExceptionFilter().catch(
    new Error(connectionDescription),
    hostFor({ method: 'GET', path: '/api/v1/system/database' }, response),
  );

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.code, 'INTERNAL_ERROR');
  assert.equal(response.body.message, 'Error interno del servidor.');
  assert.equal(response.body.requestId, 'safe-request-id');
  assert.equal(JSON.stringify(response.body).includes('private-secret'), false);
});

test('normaliza excepciones HTTP sin reutilizar mensajes arbitrarios', () => {
  const response = responseWithRequestId('safe-request-id');
  new HttpExceptionFilter().catch(
    new NotFoundException('detalle interno no publicable'),
    hostFor({ method: 'GET', path: '/api/v1/unknown' }, response),
  );

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.code, 'NOT_FOUND');
  assert.equal(response.body.message, 'Recurso no encontrado.');
  assert.equal(JSON.stringify(response.body).includes('detalle interno'), false);
});
