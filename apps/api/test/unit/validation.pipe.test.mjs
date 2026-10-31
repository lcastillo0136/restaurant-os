import 'reflect-metadata';
import assert from 'node:assert/strict';
import test from 'node:test';
import { PaginationQueryDto } from '../../dist/common/dto/pagination-query.dto.js';
import { createValidationPipe } from '../../dist/common/http/validation.pipe.js';

const metadata = {
  metatype: PaginationQueryDto,
  type: 'query',
  data: undefined,
};

test('transforma y valida la paginación compartida', async () => {
  const value = await createValidationPipe().transform({ page: '2', limit: '50', order: 'desc' }, metadata);
  assert.equal(value.page, 2);
  assert.equal(value.limit, 50);
  assert.equal(value.order, 'desc');
});

test('rechaza propiedades no permitidas y valores fuera de límite', async () => {
  await assert.rejects(
    () => createValidationPipe().transform({ page: '0', injected: 'value' }, metadata),
    (error) => {
      assert.equal(error.getStatus(), 400);
      const response = error.getResponse();
      assert.equal(response.code, 'VALIDATION_FAILED');
      assert.equal(response.message, 'La solicitud no cumple las reglas de validación.');
      assert.deepEqual(response.details.map((detail) => detail.field).sort(), ['injected', 'page']);
      return true;
    },
  );
});
