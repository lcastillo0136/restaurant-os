# Fase 1.4 — Autenticación y autorización

Fecha de implementación: 2026-10-31. Esta fase añade únicamente infraestructura backend para identidades de empleados; no crea pantallas, cuentas reales ni operaciones comerciales.

## Componentes

- `auth`: contratos `/api/v1/auth`, validación de DTO, identidad autenticada y límite local de intentos.
- `authorization`: permisos y ámbitos evaluados desde las asignaciones PostgreSQL, con guards y decoradores reutilizables.
- `security-audit`: eventos de seguridad append-only, tolerantes a una falla secundaria de auditoría.
- Prisma: `user_credentials`, `auth_sessions` y `security_audit_events` en la migración incremental `20261101000100_authentication_authorization`.

La migración está preparada para revisión y **no se ejecutó** contra `restaurant_dev`. No se alteraron migraciones anteriores ni se creó ninguna cuenta.

## Contratos

`POST /api/v1/auth/login` valida `identifier` normalizado y una contraseña de 12 a 128 caracteres. `POST /auth/refresh` rota credenciales de renovación. `POST /auth/logout` revoca la sesión autenticada. `GET /auth/me` devuelve identidad segura y grants efectivos. Todos conservan el formato de error, `requestId`, límite JSON y encabezados de Fase 1.3.

Las respuestas no devuelven hash de contraseña, detalles de usuario deshabilitado, razón de token inválido ni información que ayude a enumerar cuentas.

## Límite de alcance

No hay endpoints de pedidos, caja, cocina, pagos, CFDI, administración de usuarios ni asignación de roles. Los endpoints técnicos de health y readiness se conservaron sin cambios.
