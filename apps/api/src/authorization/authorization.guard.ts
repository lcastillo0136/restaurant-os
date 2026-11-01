import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { authorizationScopeKey, AuthorizationScope, requiredPermissionsKey } from './authorization.decorators.js';
import { AuthorizationService } from './authorization.service.js';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorization: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.getAllAndOverride<string[]>(requiredPermissionsKey, [context.getHandler(), context.getClass()]);
    if (!permissions?.length) return true;
    const scopeMetadata = this.reflector.getAllAndOverride<AuthorizationScope>(authorizationScopeKey, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest<Request>() as AuthenticatedRequest;
    const routeParameter = (name: string | undefined): string | undefined => {
      const value = name ? request.params[name] : undefined;
      return typeof value === 'string' ? value : undefined;
    };
    const organizationId = scopeMetadata ? routeParameter(scopeMetadata.organizationParam) : undefined;
    const branchId = routeParameter(scopeMetadata?.branchParam);
    if (!request.auth || !scopeMetadata || !organizationId) throw new ForbiddenException();
    if (!await this.authorization.hasPermissions(request.auth.userId, permissions, { organizationId, branchId })) {
      throw new ForbiddenException();
    }
    return true;
  }
}
