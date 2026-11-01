import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { SecurityAuditService } from '../security-audit/security-audit.service.js';
import { AuthenticatedIdentity, IssuedTokens } from './auth.types.js';
import { LoginRateLimiterService } from './login-rate-limiter.service.js';
import { PasswordService } from './password.service.js';
import { hashOpaqueToken, SessionService } from './session.service.js';

export type AuthenticatedUser = Readonly<{
  id: string;
  identitySource: string;
  identitySubject: string;
  displayName: string | null;
}>;

export type AuthResponse = Readonly<{
  user: AuthenticatedUser;
  tokens: IssuedTokens;
}>;

export function normalizeLocalIdentifier(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
}

function safeUser(identity: AuthenticatedIdentity): AuthenticatedUser {
  return {
    id: identity.userId,
    identitySource: identity.identitySource,
    identitySubject: identity.identitySubject,
    displayName: identity.displayName,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly audit: SecurityAuditService,
    private readonly rateLimiter: LoginRateLimiterService,
  ) {}

  async login(identifier: string, password: string, requestId: string): Promise<AuthResponse> {
    const normalizedIdentifier = normalizeLocalIdentifier(identifier);
    const attemptKey = `login:${hashOpaqueToken(normalizedIdentifier)}`;
    if (!this.rateLimiter.consume(attemptKey)) {
      await this.audit.record({ eventType: 'AUTH_LOGIN', result: 'RATE_LIMITED', requestId });
      throw new HttpException('Demasiados intentos.', 429);
    }

    const user = await this.prisma.appUser.findFirst({
      where: { identitySource: 'LOCAL', identitySubject: normalizedIdentifier },
      include: { credential: true },
    });
    const verified = await this.passwords.verify(password, user?.credential?.passwordHash);
    if (!user || user.status !== 'ACTIVE' || !verified) {
      await this.audit.record({
        eventType: 'AUTH_LOGIN',
        result: 'FAILURE',
        requestId,
        actorUserId: user?.id,
      });
      throw new UnauthorizedException();
    }

    this.rateLimiter.reset(attemptKey);
    const tokens = await this.sessions.issue(user.id);
    await this.audit.record({ eventType: 'AUTH_LOGIN', result: 'SUCCESS', requestId, actorUserId: user.id });
    return {
      user: {
        id: user.id,
        identitySource: user.identitySource,
        identitySubject: user.identitySubject,
        displayName: user.displayName,
      },
      tokens,
    };
  }

  async refresh(refreshToken: string, requestId: string): Promise<AuthResponse> {
    const attemptKey = `refresh:${hashOpaqueToken(refreshToken)}`;
    if (!this.rateLimiter.consume(attemptKey)) {
      await this.audit.record({ eventType: 'AUTH_REFRESH', result: 'RATE_LIMITED', requestId });
      throw new HttpException('Demasiados intentos.', 429);
    }
    const rotated = await this.sessions.rotate(refreshToken);
    if (!rotated) {
      await this.audit.record({ eventType: 'AUTH_REFRESH', result: 'FAILURE', requestId });
      throw new UnauthorizedException();
    }
    this.rateLimiter.reset(attemptKey);
    await this.audit.record({ eventType: 'AUTH_REFRESH', result: 'SUCCESS', requestId, actorUserId: rotated.user.id });
    return {
      user: {
        id: rotated.user.id,
        identitySource: rotated.user.identitySource,
        identitySubject: rotated.user.identitySubject,
        displayName: rotated.user.displayName,
      },
      tokens: rotated.tokens,
    };
  }

  async authenticate(accessToken: string): Promise<AuthenticatedIdentity> {
    const identity = await this.sessions.authenticate(accessToken);
    if (!identity) throw new UnauthorizedException();
    return identity;
  }

  async logout(identity: AuthenticatedIdentity, requestId: string): Promise<void> {
    const revoked = await this.sessions.revoke(identity.sessionId);
    if (revoked) {
      await this.audit.record({ eventType: 'AUTH_LOGOUT', result: 'REVOKED', requestId, actorUserId: identity.userId });
    }
  }

  currentUser(identity: AuthenticatedIdentity): AuthenticatedUser {
    return safeUser(identity);
  }
}
