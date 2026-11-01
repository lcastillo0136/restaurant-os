# Configuración y seguridad del backend

## Entornos

`API_EXECUTION_MODE` admite `development`, `test`, `docker` y `production`. La configuración se valida al arrancar:

- `API_HOST` y `API_PORT` se validan explícitamente.
- En `production`, el API solo acepta `127.0.0.1` o `::1` hasta aprobar TLS LAN, dominios y dispositivos.
- `API_ALLOWED_ORIGINS` acepta únicamente orígenes HTTP(S) explícitos; vacío desactiva CORS y nunca se usa `*`.
- `API_BODY_LIMIT_BYTES` limita JSON.
- `DATABASE_URL` sigue siendo privada en `.env.database`, con la cuenta `restaurant_app`; no se imprime ni se versiona.

## Controles aplicados

- Validación global: transformación controlada, whitelist y rechazo de propiedades inesperadas.
- Encabezados: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` y `Permissions-Policy` restrictiva.
- Identificador de solicitud generado por servidor y propagado en respuesta/error/log.
- Filtro de errores que evita datos sensibles al cliente.

No se habilita HSTS porque TLS LAN/proxy todavía no están aprobados. No se implementa autenticación, autorización ficticia, rate limiting externo ni monitoreo cloud. Esas decisiones permanecen pendientes antes de exponer operación comercial.
