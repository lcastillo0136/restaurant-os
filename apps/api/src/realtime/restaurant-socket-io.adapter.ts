import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { IncomingMessage } from 'node:http';
import type { ServerOptions } from 'socket.io';
import { WebsocketEnvironment } from '../environment.js';

const credentialQueryKeys = new Set(['access_token', 'accesstoken', 'authorization', 'token']);

export function isSocketOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (origin === undefined) return true;
  return allowedOrigins.includes(origin);
}

export function hasSocketCredentialQuery(request: Pick<IncomingMessage, 'url'>): boolean {
  const url = new URL(request.url ?? '/', 'http://socket.invalid');
  return [...url.searchParams.keys()].some((key) => credentialQueryKeys.has(key.toLowerCase()));
}

export function createSocketServerOptions(environment: WebsocketEnvironment): Partial<ServerOptions> {
  return {
    transports: ['websocket'],
    maxHttpBufferSize: environment.maxMessageBytes,
    pingInterval: environment.pingIntervalMs,
    pingTimeout: environment.pingTimeoutMs,
    cors: {
      origin: (origin, callback) => callback(null, isSocketOriginAllowed(origin, environment.allowedOrigins)),
      credentials: false,
      methods: ['GET'],
    },
    allowRequest: (request, callback) => {
      const origin = typeof request.headers.origin === 'string' ? request.headers.origin : undefined;
      callback(null, isSocketOriginAllowed(origin, environment.allowedOrigins) && !hasSocketCredentialQuery(request));
    },
  };
}

export class RestaurantSocketIoAdapter extends IoAdapter {
  constructor(
    application: INestApplicationContext,
    private readonly environment: WebsocketEnvironment,
  ) {
    super(application);
  }

  createIOServer(port: number, options?: ServerOptions): ReturnType<IoAdapter['createIOServer']> {
    return super.createIOServer(port, {
      ...options,
      ...createSocketServerOptions(this.environment),
    });
  }
}
