import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { resolveAuthEnvironment } from '../environment.js';
import { AuthenticatedIdentity, IssuedTokens } from './auth.types.js';

export type SessionPolicy = Readonly<{
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
}>;

type SessionUser = Readonly<{
  id: string;
  identitySource: string;
  identitySubject: string;
  displayName: string | null;
  status: string;
}>;

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function issueOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

@Injectable()
export class SessionService {
  private readonly policy: SessionPolicy;

  constructor(
    private readonly prisma: PrismaService,
    policy: SessionPolicy = resolveAuthEnvironment(),
  ) {
    this.policy = policy;
  }

  async issue(userId: string, now = new Date()): Promise<IssuedTokens> {
    const accessToken = issueOpaqueToken();
    const refreshToken = issueOpaqueToken();
    const accessExpiresAt = new Date(now.getTime() + this.policy.accessTokenTtlSeconds * 1000);
    const refreshExpiresAt = new Date(now.getTime() + this.policy.refreshTokenTtlSeconds * 1000);
    await this.prisma.authSession.create({
      data: {
        userId,
        familyId: randomUUID(),
        accessTokenHash: hashOpaqueToken(accessToken),
        accessExpiresAt,
        refreshTokenHash: hashOpaqueToken(refreshToken),
        refreshExpiresAt,
      },
    });
    return Object.freeze({ accessToken, accessExpiresAt, refreshToken, refreshExpiresAt });
  }

  async rotate(refreshToken: string, now = new Date()): Promise<{ tokens: IssuedTokens; user: SessionUser } | null> {
    const refreshTokenHash = hashOpaqueToken(refreshToken);
    const session = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    });
    if (!session || session.revokedAt || session.refreshExpiresAt <= now || session.user.status !== 'ACTIVE') return null;

    const accessToken = issueOpaqueToken();
    const nextRefreshToken = issueOpaqueToken();
    const accessExpiresAt = new Date(now.getTime() + this.policy.accessTokenTtlSeconds * 1000);
    const refreshExpiresAt = new Date(now.getTime() + this.policy.refreshTokenTtlSeconds * 1000);
    const updated = await this.prisma.authSession.updateMany({
      where: { id: session.id, refreshTokenHash, revokedAt: null },
      data: {
        accessTokenHash: hashOpaqueToken(accessToken),
        accessExpiresAt,
        refreshTokenHash: hashOpaqueToken(nextRefreshToken),
        refreshExpiresAt,
        lastUsedAt: now,
      },
    });
    if (updated.count !== 1) return null;
    return {
      tokens: Object.freeze({
        accessToken,
        accessExpiresAt,
        refreshToken: nextRefreshToken,
        refreshExpiresAt,
      }),
      user: session.user,
    };
  }

  async authenticate(accessToken: string, now = new Date()): Promise<AuthenticatedIdentity | null> {
    const session = await this.prisma.authSession.findUnique({
      where: { accessTokenHash: hashOpaqueToken(accessToken) },
      include: { user: true },
    });
    if (!session || session.revokedAt || session.accessExpiresAt <= now || session.user.status !== 'ACTIVE') return null;
    return Object.freeze({
      sessionId: session.id,
      userId: session.user.id,
      identitySource: session.user.identitySource,
      identitySubject: session.user.identitySubject,
      displayName: session.user.displayName,
    });
  }

  async revoke(sessionId: string, now = new Date()): Promise<boolean> {
    const updated = await this.prisma.authSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: now, lastUsedAt: now },
    });
    return updated.count === 1;
  }
}
