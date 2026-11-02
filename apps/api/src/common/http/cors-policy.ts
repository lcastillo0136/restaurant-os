export const allowedCorsMethods = Object.freeze(['GET', 'HEAD', 'OPTIONS', 'POST', 'PATCH']);

export function corsOptions(allowedOrigins: readonly string[]) {
  if (allowedOrigins.length === 0) return undefined;
  return { origin: [...allowedOrigins], credentials: false, methods: allowedCorsMethods };
}
