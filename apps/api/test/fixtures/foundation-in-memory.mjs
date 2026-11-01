import { randomUUID } from 'node:crypto';

export function createFoundationFixture() {
  const organizationId = randomUUID();
  const branchId = randomUUID();
  const userId = randomUUID();
  const roleId = randomUUID();
  const state = {
    organization: { id: organizationId, status: 'ACTIVE' },
    branch: { id: branchId, organizationId, status: 'ACTIVE' },
    user: {
      id: userId,
      identitySource: 'LOCAL',
      identitySubject: `integration-${randomUUID()}`,
      displayName: 'Operador de integración',
      status: 'ACTIVE',
      credential: { passwordHash: '' },
    },
    role: {
      id: roleId,
      code: 'INTEGRATION_OPERATOR',
      status: 'ACTIVE',
      permissions: [{ permission: { code: 'auth.session.read', status: 'ACTIVE' } }],
    },
    failSessionReads: false,
    failAuthorizationReads: false,
  };
  const assignment = {
    organizationId,
    branchId,
    scope: 'BRANCH',
    userId,
    organization: state.organization,
    branch: state.branch,
    role: state.role,
  };
  const sessions = [];
  const audits = [];

  const prisma = {
    appUser: {
      findFirst: async ({ where }) => (
        where.identitySource === state.user.identitySource
        && where.identitySubject === state.user.identitySubject
          ? state.user
          : null
      ),
    },
    authSession: {
      create: async ({ data }) => {
        const session = {
          id: randomUUID(),
          revokedAt: null,
          lastUsedAt: null,
          user: state.user,
          ...data,
        };
        sessions.push(session);
        return session;
      },
      findUnique: async ({ where }) => {
        if (state.failSessionReads) throw new Error('simulated session repository failure');
        return sessions.find((session) => (
          session.accessTokenHash === where.accessTokenHash || session.refreshTokenHash === where.refreshTokenHash
        )) ?? null;
      },
      updateMany: async ({ where, data }) => {
        const session = sessions.find((candidate) => candidate.id === where.id);
        if (!session || session.revokedAt !== where.revokedAt) return { count: 0 };
        if (where.refreshTokenHash && session.refreshTokenHash !== where.refreshTokenHash) return { count: 0 };
        Object.assign(session, data);
        return { count: 1 };
      },
    },
    securityAuditEvent: {
      create: async ({ data }) => { audits.push(data); },
    },
    branch: {
      findFirst: async ({ where }) => (
        state.branch.id === where.id
        && state.branch.organizationId === where.organizationId
        && state.branch.status === where.status
          ? { id: state.branch.id }
          : null
      ),
    },
    userRole: {
      findMany: async ({ where }) => {
        if (state.failAuthorizationReads) throw new Error('simulated authorization repository failure');
        return where.userId === userId ? [assignment] : [];
      },
    },
  };

  return { prisma, state, sessions, audits, organizationId, branchId, userId };
}
