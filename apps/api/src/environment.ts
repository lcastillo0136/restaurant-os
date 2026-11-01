export type ApiExecutionMode = 'development' | 'docker' | 'test' | 'production';

export type ApiEnvironment = Readonly<{
  host: string;
  port: number;
  executionMode: ApiExecutionMode;
  allowedOrigins: string[];
  bodyLimitBytes: number;
}>;

export type WebsocketEnvironment = Readonly<{
  allowedOrigins: string[];
  maxConnections: number;
  maxMessageBytes: number;
  sessionRevalidationSeconds: number;
  pingIntervalMs: number;
  pingTimeoutMs: number;
}>;

export type TransportSecurityEnvironment = Readonly<{
  enabled: boolean;
  keyPath?: string;
  certificatePath?: string;
}>;

export type AuthEnvironment = Readonly<{
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
  loginAttemptLimit: number;
  loginAttemptWindowSeconds: number;
}>;

const allowedExecutionModes = new Set<ApiExecutionMode>(['development', 'docker', 'test', 'production']);

function requiredValue(name: string, value: string | undefined, fallback: string): string {
  const resolved = value?.trim() || fallback;
  if (!resolved) throw new Error(`${name} es obligatorio.`);
  return resolved;
}

function parsePort(value: string): number {
  if (!/^\d+$/.test(value)) throw new Error('API_PORT debe ser un entero entre 1 y 65535.');
  const port = Number(value);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_PORT debe ser un entero entre 1 y 65535.');
  }
  return port;
}

function parseBodyLimit(value: string): number {
  if (!/^\d+$/.test(value)) throw new Error('API_BODY_LIMIT_BYTES debe ser un entero entre 1024 y 1048576.');
  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit < 1024 || limit > 1_048_576) {
    throw new Error('API_BODY_LIMIT_BYTES debe ser un entero entre 1024 y 1048576.');
  }
  return limit;
}

function parseBoundedInteger(name: string, value: string | undefined, fallback: string, minimum: number, maximum: number): number {
  const resolved = requiredValue(name, value, fallback);
  if (!/^\d+$/.test(resolved)) throw new Error(`${name} debe ser un entero entre ${minimum} y ${maximum}.`);
  const parsed = Number(resolved);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} debe ser un entero entre ${minimum} y ${maximum}.`);
  }
  return parsed;
}

function parseAllowedOrigins(name: string, value: string | undefined): string[] {
  if (!value?.trim()) return [];

  const origins = value.split(',').map((origin) => origin.trim()).filter(Boolean);
  const uniqueOrigins = new Set<string>();
  for (const origin of origins) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`${name} contiene un origen inválido: ${origin}.`);
    }
    if (!['http:', 'https:'].includes(parsed.protocol)
      || parsed.pathname !== '/'
      || parsed.search
      || parsed.hash
      || parsed.username
      || parsed.password) {
      throw new Error(`${name} contiene un origen HTTP(S) inválido: ${origin}.`);
    }
    uniqueOrigins.add(parsed.origin);
  }
  return [...uniqueOrigins];
}

function parseBoolean(name: string, value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '') return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${name} debe ser true o false.`);
}

function isLoopbackHost(host: string): boolean {
  return host === '127.0.0.1' || host === '::1';
}

export function resolveApiEnvironment(environment: NodeJS.ProcessEnv = process.env): ApiEnvironment {
  const host = requiredValue('API_HOST', environment.API_HOST, '127.0.0.1');
  if (/[\s/]/.test(host) || host.includes('://')) {
    throw new Error('API_HOST debe ser un host o dirección IP sin esquema ni ruta.');
  }

  const executionMode = requiredValue('API_EXECUTION_MODE', environment.API_EXECUTION_MODE, 'development');
  if (!allowedExecutionModes.has(executionMode as ApiExecutionMode)) {
    throw new Error('API_EXECUTION_MODE debe ser development, docker, test o production.');
  }
  const allowedOrigins = parseAllowedOrigins('API_ALLOWED_ORIGINS', environment.API_ALLOWED_ORIGINS);
  const lanExposureAuthorized = parseBoolean('API_LAN_EXPOSURE_AUTHORIZED', environment.API_LAN_EXPOSURE_AUTHORIZED, false);
  const tlsEnabled = parseBoolean('API_TLS_ENABLED', environment.API_TLS_ENABLED, false);
  if (!isLoopbackHost(host) && (!lanExposureAuthorized || !tlsEnabled || allowedOrigins.length === 0)) {
    throw new Error('API_HOST debe permanecer en loopback hasta que el propietario autorice LAN, configure TLS y defina orígenes permitidos.');
  }

  return Object.freeze({
    host,
    port: parsePort(requiredValue('API_PORT', environment.API_PORT, '3000')),
    executionMode: executionMode as ApiExecutionMode,
    allowedOrigins,
    bodyLimitBytes: parseBodyLimit(requiredValue('API_BODY_LIMIT_BYTES', environment.API_BODY_LIMIT_BYTES, '65536')),
  });
}

export function resolveWebsocketEnvironment(environment: NodeJS.ProcessEnv = process.env): WebsocketEnvironment {
  const sourceOrigins = environment.API_WS_ALLOWED_ORIGINS ?? environment.API_ALLOWED_ORIGINS;
  return Object.freeze({
    allowedOrigins: parseAllowedOrigins('API_WS_ALLOWED_ORIGINS', sourceOrigins),
    maxConnections: parseBoundedInteger('API_WS_MAX_CONNECTIONS', environment.API_WS_MAX_CONNECTIONS, '100', 1, 500),
    maxMessageBytes: parseBoundedInteger('API_WS_MAX_MESSAGE_BYTES', environment.API_WS_MAX_MESSAGE_BYTES, '16384', 1024, 65536),
    sessionRevalidationSeconds: parseBoundedInteger('API_WS_SESSION_REVALIDATION_SECONDS', environment.API_WS_SESSION_REVALIDATION_SECONDS, '60', 30, 900),
    pingIntervalMs: parseBoundedInteger('API_WS_PING_INTERVAL_MS', environment.API_WS_PING_INTERVAL_MS, '25000', 5000, 60000),
    pingTimeoutMs: parseBoundedInteger('API_WS_PING_TIMEOUT_MS', environment.API_WS_PING_TIMEOUT_MS, '20000', 5000, 60000),
  });
}

export function resolveTransportSecurityEnvironment(environment: NodeJS.ProcessEnv = process.env): TransportSecurityEnvironment {
  const enabled = parseBoolean('API_TLS_ENABLED', environment.API_TLS_ENABLED, false);
  if (!enabled) return Object.freeze({ enabled: false });
  const keyPath = requiredValue('API_TLS_KEY_PATH', environment.API_TLS_KEY_PATH, '');
  const certificatePath = requiredValue('API_TLS_CERT_PATH', environment.API_TLS_CERT_PATH, '');
  return Object.freeze({ enabled: true, keyPath, certificatePath });
}

export function resolveAuthEnvironment(environment: NodeJS.ProcessEnv = process.env): AuthEnvironment {
  const accessTokenTtlSeconds = parseBoundedInteger('AUTH_ACCESS_TOKEN_TTL_SECONDS', environment.AUTH_ACCESS_TOKEN_TTL_SECONDS, '900', 60, 3600);
  const refreshTokenTtlSeconds = parseBoundedInteger('AUTH_REFRESH_TOKEN_TTL_SECONDS', environment.AUTH_REFRESH_TOKEN_TTL_SECONDS, '604800', 3600, 2_592_000);
  if (refreshTokenTtlSeconds <= accessTokenTtlSeconds) {
    throw new Error('AUTH_REFRESH_TOKEN_TTL_SECONDS debe ser mayor que AUTH_ACCESS_TOKEN_TTL_SECONDS.');
  }
  return Object.freeze({
    accessTokenTtlSeconds,
    refreshTokenTtlSeconds,
    loginAttemptLimit: parseBoundedInteger('AUTH_LOGIN_ATTEMPT_LIMIT', environment.AUTH_LOGIN_ATTEMPT_LIMIT, '5', 1, 20),
    loginAttemptWindowSeconds: parseBoundedInteger('AUTH_LOGIN_ATTEMPT_WINDOW_SECONDS', environment.AUTH_LOGIN_ATTEMPT_WINDOW_SECONDS, '900', 60, 3600),
  });
}
