import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthorizationGuard } from './authorization.guard.js';
import { authorizationScopeKey, AuthorizationScope, requiredPermissionsKey } from './authorization.metadata.js';

export { authorizationScopeKey, AuthorizationScope, requiredPermissionsKey } from './authorization.metadata.js';

export const RequirePermissions = (...permissions: string[]) => applyDecorators(
  SetMetadata(requiredPermissionsKey, permissions),
  UseGuards(AuthGuard, AuthorizationGuard),
);
export const RequireAuthorizationScope = (scope: AuthorizationScope) => SetMetadata(authorizationScopeKey, scope);
