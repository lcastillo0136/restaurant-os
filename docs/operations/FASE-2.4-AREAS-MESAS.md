# Fase 2.4 — Áreas, mesas y control de ocupación

## Alcance preparado

Se añaden `Area`, `DiningTable` y `TableSession`, siempre dentro de una organización y sucursal. Área usa código estable único por sucursal; mesa usa código único por sucursal, capacidad positiva y área de la misma sucursal. `deviceId` es nullable y no existe endpoint de vinculación.

La migración `20261102000100_areas_tables_sessions` no fue aplicada. Incluye FKs compuestas de alcance, CHECK de capacidad/versión y el índice parcial `table_sessions_one_open_per_table` para una única sesión `OPEN` por mesa.

## Estados y sesiones

Mesas: `AVAILABLE`, `OCCUPIED`, `CLEANING`, `RESERVED`, `BLOCKED`, `OUT_OF_SERVICE`. Sólo abrir sesión cambia `AVAILABLE` a `OCCUPIED`; sólo cerrar estructuralmente cambia `OCCUPIED` a `CLEANING`. La administración no puede establecer `OCCUPIED`. `CLEANING` requiere transición administrativa explícita a `AVAILABLE`. Áreas con mesas no se desactivan.

Una sesión se abre sólo sobre mesa disponible; se cierra con la versión esperada y conserva la fila con estado `CLOSED`, `closedAt` y versión incrementada. Antes de cambiar la mesa a `CLEANING`, el cierre exige dentro de la misma transacción que siga `OCCUPIED`; una precondición incompatible produce conflicto y revierte el cierre. El cierre no representa cierre comercial, pedidos, pagos ni saldos.

## API, RBAC y auditoría

Rutas bajo `/api/v1/organizations/:organizationId/branches/:branchId` cubren CRUD administrativo de áreas/mesas, cambio controlado de estado, listado/historial de sesiones, apertura y cierre estructural. Permisos propuestos: `areas.read/manage`, `tables.read/manage` y `table-sessions.read/manage`. Todos reutilizan `AuthGuard`, `AuthorizationGuard` y alcance de sucursal.

Las mutaciones escriben `AuditEvent` dentro de la transacción: `AREA_CREATED`, `AREA_UPDATED`, `AREA_ACTIVATED/DEACTIVATED`, `TABLE_CREATED`, `TABLE_UPDATED`, `TABLE_STATUS_CHANGED`, `TABLE_SESSION_OPENED` y `TABLE_SESSION_CLOSED`.

## Evidencia y límites

`pnpm --filter @restaurant-os/api test:phase-2.4` pasó 8/8: estructura Prisma/SQL e índice parcial, ValidationPipe real, AuthorizationGuard con AuthorizationService reales, áreas, mesas, transiciones, sesiones, conflictos de versión y rollback de auditoría con fixture transaccional. Es evidencia estática/en memoria, no HTTP integral ni PostgreSQL.

Persisten pendientes: aplicar/validar migración sólo contra PostgreSQL temporal autorizado; concurrencia real, aislamiento/reintentos de serialización e idempotencia persistida; política RBAC definitiva, dispositivos, sesiones comerciales, pedidos/pagos, TLS/WSS, LAN, dispositivos, backup/restore y prueba sin WAN.
