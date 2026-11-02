import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

test('el esquema laboral separa empleados, asignaciones y turnos de caja', async () => {
  const schema = await readFile(resolve(process.cwd(), 'prisma/schema.prisma'), 'utf8');
  for (const model of ['Employee', 'EmployeeBranchAssignment', 'WorkShift', 'WorkShiftAssignment']) assert.match(schema, new RegExp(`model ${model} \\{`));
  assert.match(schema, /@@unique\(\[organizationId, employeeCode\]\)/);
  assert.match(schema, /@@unique\(\[workShiftId,employeeId\]\)/);
  assert.doesNotMatch(schema, /CashShift/);
});
