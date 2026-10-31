export type ApiExecutionMode = 'development' | 'docker' | 'test' | 'production';

export type ApiEnvironment = Readonly<{
  host: string;
  port: number;
  executionMode: ApiExecutionMode;
  allowedOrigins: string[];
  bodyLimitBytes: number;
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

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value?.trim()) return [];

  const origins = value.split(',').map((origin) => origin.trim()).filter(Boolean);
  const uniqueOrigins = new Set<string>();
  for (const origin of origins) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`API_ALLOWED_ORIGINS contiene un origen inválido: ${origin}.`);
    }
    if (!['http:', 'https:'].includes(parsed.protocol)
      || parsed.pathname !== '/'
      || parsed.search
      || parsed.hash
      || parsed.username
      || parsed.password) {
      throw new Error(`API_ALLOWED_ORIGINS contiene un origen HTTP(S) inválido: ${origin}.`);
    }
    uniqueOrigins.add(parsed.origin);
  }
  return [...uniqueOrigins];
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
  if (executionMode === 'production' && host !== '127.0.0.1' && host !== '::1') {
    throw new Error('API_HOST debe permanecer en loopback en production hasta aprobar TLS LAN y aprovisionamiento de dispositivos.');
  }

  return Object.freeze({
    host,
    port: parsePort(requiredValue('API_PORT', environment.API_PORT, '3000')),
    executionMode: executionMode as ApiExecutionMode,
    allowedOrigins: parseAllowedOrigins(environment.API_ALLOWED_ORIGINS),
    bodyLimitBytes: parseBodyLimit(requiredValue('API_BODY_LIMIT_BYTES', environment.API_BODY_LIMIT_BYTES, '65536')),
  });
}
