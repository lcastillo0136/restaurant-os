import type { Request } from 'express';

export type IssuedTokens = Readonly<{
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken: string;
  refreshExpiresAt: Date;
}>;

export type AuthenticatedIdentity = Readonly<{
  sessionId: string;
  userId: string;
  identitySource: string;
  identitySubject: string;
  displayName: string | null;
}>;

export type AuthenticatedRequest = Request & {
  auth?: AuthenticatedIdentity;
};
