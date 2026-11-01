import { randomUUID } from 'node:crypto';

export const realtimeProtocolVersion = '1' as const;

export const realtimeSubscriptionPolicies = {
  'technical.connection': {
    requiredPermission: 'auth.session.read',
    branchRequired: false,
  },
} as const;

export type RealtimeSubscriptionType = keyof typeof realtimeSubscriptionPolicies;

export type RealtimeSubscriptionRequest = Readonly<{
  organizationId: string;
  branchId?: string;
  eventTypes: RealtimeSubscriptionType[];
  correlationId?: string;
}>;

export type RealtimeEventType =
  | 'technical.connection.ready'
  | 'technical.subscription.confirmed'
  | 'technical.communication.error'
  | 'technical.session.revalidated';

export type RealtimeEvent<TData extends Record<string, unknown> = Record<string, unknown>> = Readonly<{
  eventId: string;
  version: typeof realtimeProtocolVersion;
  type: RealtimeEventType;
  emittedAt: string;
  correlationId: string;
  organizationId?: string;
  branchId?: string;
  data: TData;
}>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && uuidPattern.test(value);
}

export function parseRealtimeSubscriptionRequest(value: unknown): RealtimeSubscriptionRequest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const { organizationId, branchId, eventTypes, correlationId } = candidate;
  if (!isUuid(organizationId)
    || (branchId !== undefined && !isUuid(branchId))
    || (correlationId !== undefined && !isUuid(correlationId))
    || !Array.isArray(eventTypes)
    || eventTypes.length === 0
    || eventTypes.length > 10
    || eventTypes.some((eventType) => typeof eventType !== 'string' || !(eventType in realtimeSubscriptionPolicies))
    || new Set(eventTypes).size !== eventTypes.length) {
    return null;
  }
  return {
    organizationId,
    ...(branchId === undefined ? {} : { branchId }),
    eventTypes: eventTypes as RealtimeSubscriptionType[],
    ...(correlationId === undefined ? {} : { correlationId }),
  };
}

export function createRealtimeEvent<TData extends Record<string, unknown>>(
  type: RealtimeEventType,
  data: TData,
  scope: Readonly<{ organizationId?: string; branchId?: string; correlationId?: string }> = {},
): RealtimeEvent<TData> {
  return Object.freeze({
    eventId: randomUUID(),
    version: realtimeProtocolVersion,
    type,
    emittedAt: new Date().toISOString(),
    correlationId: scope.correlationId ?? randomUUID(),
    ...(scope.organizationId ? { organizationId: scope.organizationId } : {}),
    ...(scope.branchId ? { branchId: scope.branchId } : {}),
    data: Object.freeze({ ...data }),
  });
}

export function roomForSubscription(scope: Readonly<{
  organizationId: string;
  branchId?: string;
  eventType: RealtimeSubscriptionType;
}>): string {
  const branch = scope.branchId ?? 'organization';
  return `restaurant-os:v1:organization:${scope.organizationId}:branch:${branch}:event:${scope.eventType}`;
}
