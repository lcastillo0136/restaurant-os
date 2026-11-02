import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

test('el esquema laboral separa empleados, asignaciones y turnos de caja', async () => {
  const schema = await readFile(resolve(process.cwd(), 'prisma/schema.prisma'), 'utf8');
  for (const model of ['Employee', 'EmployeeBranchAssignment', 'WorkShift', 'WorkShiftAssignment']) assert.match(schema, new RegExp(`model ${model} \\{`));
  assert.match(schema, /@@unique\(\[organizationId, employeeCode\]\)/);
  assert.match(schema, /@@unique\(\[workShiftId,employeeId\]\)/);
  assert.match(schema, /@relation\(fields:\[employeeId,organizationId\],references:\[id,organizationId\]/);
  const migration = await readFile(resolve(process.cwd(), 'prisma/migrations/20261101000200_employees_work_shifts/migration.sql'), 'utf8');
  assert.match(migration, /CHECK \("scheduled_end" > "scheduled_start"\)/);
  assert.match(migration, /"employee_id","organization_id"\) REFERENCES "employees"/);
  assert.doesNotMatch(schema, /CashShift/);
});
