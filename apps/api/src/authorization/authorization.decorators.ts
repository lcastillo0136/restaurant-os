import { SetMetadata } from '@nestjs/common';

export const requiredPermissionsKey = 'restaurant-os:required-permissions';
export const authorizationScopeKey = 'restaurant-os:authorization-scope';

export type AuthorizationScope = Readonly<{
  organizationParam: string;
  branchParam?: string;
}>;

export const RequirePermissions = (...permissions: string[]) => SetMetadata(requiredPermissionsKey, permissions);
export const RequireAuthorizationScope = (scope: AuthorizationScope) => SetMetadata(authorizationScopeKey, scope);
