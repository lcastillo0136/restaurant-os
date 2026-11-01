export const requiredPermissionsKey = 'restaurant-os:required-permissions';
export const authorizationScopeKey = 'restaurant-os:authorization-scope';

export type AuthorizationScope = Readonly<{
  organizationParam: string;
  branchParam?: string;
}>;
