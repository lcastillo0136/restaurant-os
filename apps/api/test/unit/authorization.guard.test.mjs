import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthorizationGuard } from '../../dist/authorization/authorization.guard.js';

function guardFor({ permissions, scope, request, allowed = true }) {
  const reflector = {
    getAllAndOverride: (key) => key === 'restaurant-os:required-permissions' ? permissions : scope,
  };
  const calls = [];
  const authorization = {
    hasPermissions: async (...arguments_) => {
      calls.push(arguments_);
      return allowed;
    },
  };
  return {
    guard: new AuthorizationGuard(reflector, authorization),
    calls,
    context: {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    },
  };
}

const authenticatedRequest = {
  auth: { userId: 'user-1' },
  params: { organizationId: 'organization-a', branchId: 'branch-a1' },
};

test('rechaza un guard sin permisos declarados', async () => {
  const subject = guardFor({ permissions: undefined, scope: { organizationParam: 'organizationId' }, request: authenticatedRequest });
  await assert.rejects(() => subject.guard.canActivate(subject.context), { status: 403 });
  assert.equal(subject.calls.length, 0);
});

test('rechaza metadatos de alcance incompletos', async () => {
  const subject = guardFor({
    permissions: ['cash.open'],
    scope: { organizationParam: 'organizationId', branchParam: 'branchId' },
    request: { auth: { userId: 'user-1' }, params: { organizationId: 'organization-a' } },
  });
  await assert.rejects(() => subject.guard.canActivate(subject.context), { status: 403 });
  assert.equal(subject.calls.length, 0);
});

test('permite una política completa cuando el servicio autoriza el permiso y alcance', async () => {
  const subject = guardFor({
    permissions: ['cash.open'],
    scope: { organizationParam: 'organizationId', branchParam: 'branchId' },
    request: authenticatedRequest,
  });
  assert.equal(await subject.guard.canActivate(subject.context), true);
  assert.deepEqual(subject.calls, [['user-1', ['cash.open'], { organizationId: 'organization-a', branchId: 'branch-a1' }]]);
});
