import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service.js';
import { AuthenticatedIdentity } from '../auth/auth.types.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { WebsocketEnvironment } from '../environment.js';
import {
  createRealtimeEvent,
  parseRealtimeSubscriptionRequest,
  RealtimeSubscriptionRequest,
  realtimeSubscriptionPolicies,
  roomForSubscription,
} from './realtime.contracts.js';

type RealtimeSocket = Socket & {
  data: {
    identity?: AuthenticatedIdentity;
  };
};

type ActiveConnection = {
  client: RealtimeSocket;
  accessToken: string;
  identity: AuthenticatedIdentity;
  rooms: Set<string>;
};

export const websocketEnvironmentToken = Symbol('websocket-environment');

function extractSocketAccessToken(client: RealtimeSocket): string | null {
  const value = client.handshake.auth?.accessToken;
  return typeof value === 'string' && /^[A-Za-z0-9_-]{43,512}$/.test(value) ? value : null;
}

function subscriptionPayloadSize(value: unknown): number {
  try {
    return Buffer.byteLength(JSON.stringify(value), 'utf8');
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

@Injectable()
@WebSocketGateway({ namespace: '/realtime', transports: ['websocket'] })
export class RealtimeGateway implements OnGatewayInit<Namespace>, OnGatewayConnection<RealtimeSocket>, OnGatewayDisconnect<RealtimeSocket>, OnModuleDestroy {
  @WebSocketServer()
  private server?: Namespace;

  private readonly connections = new Map<string, ActiveConnection>();
  private revalidationTimer?: NodeJS.Timeout;

  constructor(
    private readonly auth: AuthService,
    private readonly authorization: AuthorizationService,
    @Inject(websocketEnvironmentToken) private readonly environment: WebsocketEnvironment,
  ) {}

  afterInit(server: Namespace): void {
    this.server = server;
    server.use((client, next) => {
      void this.authenticateHandshake(client as RealtimeSocket)
        .then(() => next())
        .catch(() => next(new Error('unauthorized')));
    });
    this.revalidationTimer = setInterval(() => {
      void this.revalidateConnections();
    }, this.environment.sessionRevalidationSeconds * 1000);
    this.revalidationTimer.unref?.();
  }

  async authenticateHandshake(client: RealtimeSocket): Promise<void> {
    const token = extractSocketAccessToken(client);
    if (!token) throw new Error('unauthorized');
    const identity = await this.auth.authenticate(token);
    client.data.identity = identity;
    this.connections.set(client.id, {
      client,
      accessToken: token,
      identity,
      rooms: new Set<string>(),
    });
  }

  handleConnection(client: RealtimeSocket): void {
    const connection = this.connections.get(client.id);
    if (!connection || this.connections.size > this.environment.maxConnections) {
      this.reject(client, 'CONNECTION_LIMIT_REACHED');
      this.connections.delete(client.id);
      client.disconnect(true);
      return;
    }
    client.emit('server.realtime.event', createRealtimeEvent('technical.connection.ready', {
      reconnect: {
        initialDelayMs: 500,
        maxDelayMs: 30_000,
        maxAttempts: 8,
      },
    }));
  }

  @SubscribeMessage('client.realtime.subscribe')
  async handleSubscribe(client: RealtimeSocket, payload: unknown): Promise<void> {
    const connection = this.connections.get(client.id);
    if (!connection) {
      this.reject(client, 'UNAUTHORIZED');
      client.disconnect(true);
      return;
    }
    if (subscriptionPayloadSize(payload) > this.environment.maxMessageBytes) {
      this.reject(client, 'MESSAGE_TOO_LARGE');
      return;
    }
    const request = parseRealtimeSubscriptionRequest(payload);
    if (!request || !await this.isSubscriptionAllowed(connection.identity, request)) {
      this.reject(client, 'SUBSCRIPTION_DENIED', request?.correlationId);
      return;
    }
    for (const eventType of request.eventTypes) {
      const room = roomForSubscription({
        organizationId: request.organizationId,
        ...(request.branchId ? { branchId: request.branchId } : {}),
        eventType,
      });
      await client.join(room);
      connection.rooms.add(room);
      client.emit('server.realtime.event', createRealtimeEvent('technical.subscription.confirmed', {
        eventType,
      }, {
        organizationId: request.organizationId,
        ...(request.branchId ? { branchId: request.branchId } : {}),
        correlationId: request.correlationId,
      }));
    }
  }

  handleDisconnect(client: RealtimeSocket): void {
    this.connections.delete(client.id);
  }

  async revalidateConnections(): Promise<void> {
    await Promise.all([...this.connections.values()].map(async (connection) => {
      try {
        const identity = await this.auth.authenticate(connection.accessToken);
        if (identity.sessionId !== connection.identity.sessionId || identity.userId !== connection.identity.userId) {
          throw new Error('session changed');
        }
        connection.identity = identity;
        connection.client.data.identity = identity;
      } catch {
        this.reject(connection.client, 'SESSION_INVALID');
        connection.client.disconnect(true);
        this.connections.delete(connection.client.id);
      }
    }));
  }

  onModuleDestroy(): void {
    if (this.revalidationTimer) clearInterval(this.revalidationTimer);
    this.connections.clear();
  }

  get activeConnectionCount(): number {
    return this.connections.size;
  }

  private async isSubscriptionAllowed(identity: AuthenticatedIdentity, request: RealtimeSubscriptionRequest): Promise<boolean> {
    const policies = request.eventTypes.map((eventType) => realtimeSubscriptionPolicies[eventType]);
    if (policies.some((policy) => policy.branchRequired && !request.branchId)) return false;
    const requiredPermissions = [...new Set(policies.map((policy) => policy.requiredPermission))];
    return this.authorization.hasPermissions(identity.userId, requiredPermissions, {
      organizationId: request.organizationId,
      ...(request.branchId ? { branchId: request.branchId } : {}),
    });
  }

  private reject(client: RealtimeSocket, code: string, correlationId?: string): void {
    client.emit('server.realtime.event', createRealtimeEvent('technical.communication.error', { code }, { correlationId }));
  }
}
