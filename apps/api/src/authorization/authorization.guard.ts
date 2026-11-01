import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { authorizationScopeKey, AuthorizationScope, requiredPermissionsKey } from './authorization.metadata.js';
import { AuthorizationService } from './authorization.service.js';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorization: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.getAllAndOverride<string[]>(requiredPermissionsKey, [context.getHandler(), context.getClass()]);
    const scopeMetadata = this.reflector.getAllAndOverride<AuthorizationScope>(authorizationScopeKey, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest<Request>() as AuthenticatedRequest;
    const validPermissions = Array.isArray(permissions)
      && permissions.length > 0
      && permissions.every((permission) => typeof permission === 'string' && permission.trim().length > 0);
    const validScopeMetadata = Boolean(scopeMetadata)
      && typeof scopeMetadata.organizationParam === 'string'
      && scopeMetadata.organizationParam.trim().length > 0
      && (scopeMetadata.branchParam === undefined || (typeof scopeMetadata.branchParam === 'string' && scopeMetadata.branchParam.trim().length > 0));
    const routeParameter = (name: string | undefined): string | undefined => {
      const value = name ? request.params[name] : undefined;
      return typeof value === 'string' ? value : undefined;
    };
    const organizationId = validScopeMetadata ? routeParameter(scopeMetadata.organizationParam) : undefined;
    const branchId = validScopeMetadata ? routeParameter(scopeMetadata.branchParam) : undefined;
    if (!validPermissions || !validScopeMetadata || !request.auth || !organizationId || (scopeMetadata.branchParam && !branchId)) {
      throw new ForbiddenException();
    }
    if (!await this.authorization.hasPermissions(request.auth.userId, permissions, { organizationId, branchId })) {
      throw new ForbiddenException();
    }
    return true;
  }
}
