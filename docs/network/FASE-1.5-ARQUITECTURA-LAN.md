# Fase 1.5 — Arquitectura LAN y WebSocket

Fecha: 2026-11-01. Estado: implementación local pendiente de revisión; no publicada, no expuesta en LAN y sin operaciones comerciales.

## Decisión

Se adopta **Socket.IO** con el adaptador oficial de NestJS. Es la decisión ya indicada en `docs/01-ARQUITECTURA.md`: el transporte comparte proceso y puerto con NestJS, funciona con React y Flutter mediante clientes Socket.IO, ofrece reconexión controlable y no requiere un broker ni un segundo servidor. No se instala ni expone WebSocket estándar adicional.

## Topología actual y futura

```
Actual:  cliente de prueba local -> 127.0.0.1:3000/api/v1 y /realtime -> NestJS -> PostgreSQL
Futuro:  React / Flutter -> TLS/WSS LAN aprobado -> NestJS REST + Socket.IO -> PostgreSQL
```

El proceso solo acepta `127.0.0.1` o `::1` por defecto. El código rechaza una dirección no loopback salvo que coincidan los tres controles: `API_LAN_EXPOSURE_AUTHORIZED=true`, `API_TLS_ENABLED=true` y al menos un origen HTTP(S) explícito. Esa variable es una barrera técnica, no sustituye la aprobación del propietario, la VLAN ni la configuración de firewall; no se modificó ninguna de ellas.

## Componentes

| Ubicación | Responsabilidad |
| --- | --- |
| `apps/api/src/realtime/restaurant-socket-io.adapter.ts` | Socket.IO, WebSocket puro como transporte, validación de `Origin`, rechazo de credenciales en query y límites de trama. |
| `apps/api/src/realtime/realtime.gateway.ts` | Handshake autenticado, límite de conexiones, suscripción validada, revalidación de sesión y RBAC, abandono de salas revocadas y limpieza. |
| `apps/api/src/realtime/realtime.contracts.ts` | Protocolo v1, validación de solicitudes y nombre interno de salas. |
| `apps/api/src/environment.ts` | Variables de host, TLS, CORS, tamaño, ping, máximo de conexiones y revalidación. |

`RealtimeGateway` reutiliza `AuthService.authenticate()`: cada validación consulta la sesión persistida, verifica expiración, revocación y usuario activo. La credencial solo se recibe en `handshake.auth.accessToken`, permanece en memoria privada durante la conexión para revalidarla y nunca se escribe en logs, eventos ni respuestas. El identificador, organización, sucursal y permisos nunca proceden de afirmaciones del cliente.

El gateway vuelve a validar cada conexión y cada suscripción cada 60 segundos por defecto. El intervalo se configura mediante `API_WS_SESSION_REVALIDATION_SECONDS`, con mínimo de 30 y máximo de 900 segundos: esa es la ventana máxima configurada para detectar una revocación, no una promesa de revocación instantánea. Si la sesión deja de ser válida, envía solo `SESSION_INVALID`, desconecta el socket y elimina sus recursos. Si una consulta RBAC ya no permite una suscripción (rol/permiso, organización, sucursal o alcance), abandona solo esa sala y emite `SUBSCRIPTION_REVOKED`; si no puede revalidar la autorización de forma segura, desconecta con `AUTHORIZATION_REVALIDATION_FAILED`. Al desconectar se elimina la entrada de conexión; Socket.IO abandona sus salas. El máximo por defecto es 100 conexiones y los mensajes técnicos se limitan a 16 KiB.

## REST y estado

REST conserva el prefijo `/api/v1`, sus healthchecks y contratos de autenticación existentes. WebSocket solo es una señal en tiempo real; PostgreSQL y los endpoints REST autoritativos seguirán siendo la fuente de estado. No hay endpoint de snapshot, outbox, cola ni garantía de entrega en esta fase. La recuperación debe pedir un snapshot REST autorizado antes de tratar eventos posteriores como actuales.

## Configuración segura

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `API_HOST` / `API_PORT` | `127.0.0.1` / `3000` | Escucha HTTP(S) y Socket.IO compartida. |
| `API_ALLOWED_ORIGINS` | vacío | CORS REST; sin comodines. |
| `API_WS_ALLOWED_ORIGINS` | hereda API | Orígenes browser permitidos en Socket.IO. |
| `API_WS_MAX_CONNECTIONS` | `100` | Límite local de conexiones. |
| `API_WS_MAX_MESSAGE_BYTES` | `16384` | Tamaño máximo de mensaje. |
| `API_WS_SESSION_REVALIDATION_SECONDS` | `60` | Intervalo de revalidación. |
| `API_WS_PING_INTERVAL_MS` / `API_WS_PING_TIMEOUT_MS` | `25000` / `20000` | Detección de conexión perdida. |
| `API_TLS_*` | desactivado | Certificado y clave locales, no versionados. |

No se aplicaron migraciones, no se modificó Prisma ni se conectó a PostgreSQL local durante estas pruebas.
