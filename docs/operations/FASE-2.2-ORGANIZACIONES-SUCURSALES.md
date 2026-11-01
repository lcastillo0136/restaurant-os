# Fase 2.2 — Organizaciones y sucursales

## Alcance implementado

Backend NestJS bajo `/api/v1/organizations/:organizationId`:

- `GET` y `PATCH` de organización activa.
- `GET`/`POST` de sucursales, y `GET`/`PATCH` de una sucursal.
- DTO estrictos; código de sucursal, nombre, estado y zona horaria validados. `organizationId`, `branchId` y código son inmutables en actualizaciones.
- Guards aprobados: `organizations.read`, `organizations.manage`, `branches.read`, `branches.manage`, todos con `AuthGuard` y `AuthorizationGuard`.
- La autorización valida organización/sucursal activa y pertenencia. No hay creación de organización, autoservicio de roles ni concesión automática de permisos.
- Cada escritura ocurre en transacción con evento `AuditEvent`; si la auditoría falla, la transacción falla. Eventos: `ORGANIZATION_UPDATED`, `BRANCH_CREATED`, `BRANCH_UPDATED`, `BRANCH_ACTIVATED`, `BRANCH_DEACTIVATED`.

## Decisiones pendientes y límites

Los cuatro permisos son propuestas de contrato: no se sembraron permisos, roles ni cuentas. No hubo conexión, migración ni escritura sobre PostgreSQL; las pruebas usan fixture en memoria. La creación inicial de organizaciones sigue bloqueada a la espera de un flujo de plataforma aprobado. Permanecen diferidos PostgreSQL temporal, TLS/LAN, restauración y clientes React/Flutter.

## Evidencia

`pnpm --filter @restaurant-os/api test:phase-2.2`: build API y 1/1 prueba en memoria correcta (creación, duplicado, aislamiento cruzado, inactivación y auditoría).
