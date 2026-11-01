export type ValidationDetail = Readonly<{
  field: string;
  constraints: string[];
}>;

export type ApiErrorBody = Readonly<{
  statusCode: number;
  code: string;
  message: string;
  requestId: string;
  timestamp: string;
  path: string;
  details?: ValidationDetail[];
}>;

const safeMessages: Record<number, Readonly<{ code: string; message: string }>> = {
  400: { code: 'BAD_REQUEST', message: 'La solicitud no es válida.' },
  401: { code: 'UNAUTHORIZED', message: 'Autenticación requerida.' },
  403: { code: 'FORBIDDEN', message: 'Acceso no permitido.' },
  404: { code: 'NOT_FOUND', message: 'Recurso no encontrado.' },
  413: { code: 'PAYLOAD_TOO_LARGE', message: 'El cuerpo de la solicitud excede el límite permitido.' },
  429: { code: 'TOO_MANY_REQUESTS', message: 'Demasiadas solicitudes.' },
  500: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor.' },
};

export function createApiErrorBody(
  statusCode: number,
  requestId: string,
  path: string,
  details?: ValidationDetail[],
): ApiErrorBody {
  const safe = safeMessages[statusCode] ?? safeMessages[500];
  return {
    statusCode,
    code: details ? 'VALIDATION_FAILED' : safe.code,
    message: details ? 'La solicitud no cumple las reglas de validación.' : safe.message,
    requestId,
    timestamp: new Date().toISOString(),
    path: path.startsWith('/') ? path : '/',
    ...(details && details.length > 0 ? { details } : {}),
  };
}
