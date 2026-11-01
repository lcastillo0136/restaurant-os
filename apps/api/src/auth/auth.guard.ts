import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { AuthenticatedRequest } from './auth.types.js';

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer ([A-Za-z0-9_-]{43,512})$/.exec(header);
  return match?.[1] ?? null;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>() as AuthenticatedRequest;
    const token = extractBearerToken(request.header('authorization'));
    if (!token) throw new UnauthorizedException();
    request.auth = await this.auth.authenticate(token);
    return true;
  }
}
