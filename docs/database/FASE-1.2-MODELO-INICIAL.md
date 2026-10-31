# Fase 1.2 — Modelo PostgreSQL inicial

Fecha de implementación: 2026-10-31.

## Alcance realizado

La Fase 1.2 incorpora el fundamento relacional versionado de Restaurant OS con Prisma 7 y PostgreSQL 17 nativo. No incorpora funcionalidades de operación, pantallas, endpoints comerciales ni credenciales de personas.

| Área | Tablas | Decisión aplicada |
| --- | --- | --- |
| Organización | `organizations`, `branches` | UUID, una organización puede tener muchas sucursales y `branch_id` queda disponible desde la base. |
| Identidad | `users` | Solo identidad externa, estado y nombre visible opcional; no almacena contraseñas ni sesiones. |
| RBAC | `roles`, `permissions`, `role_permissions`, `user_roles` | Relaciones muchos-a-muchos y asignación con organización explícita y alcance de organización o sucursal. No se sembraron políticas, roles ni permisos de producto. |
| Auditoría | `audit_events` | Estructura append-only preparada para actor, entidad, contexto de organización/sucursal, metadatos JSONB y fecha UTC. No hay aún escritor funcional de auditoría. |

## Convenciones y restricciones

- Todas las claves primarias y foráneas usan UUID.
- Las fechas se almacenan como `TIMESTAMPTZ(6)` en UTC; la zona operativa se guarda en `branches.time_zone`.
- Los estados son enums explícitos y no se eliminan registros por cascada (`ON DELETE RESTRICT`).
- `branches` es único por `(organization_id, code)`; `users` por `(identity_source, identity_subject)`; `roles`, `permissions` y `organizations` por código.
- `user_roles.organization_id` es obligatorio para todo alcance. Una FK compuesta `(branch_id, organization_id)` hacia `branches(id, organization_id)` impide asignar una sucursal de otra organización. El `CHECK` exige que `ORGANIZATION` no tenga sucursal y `BRANCH` sí la tenga; el índice único incluye organización y evita duplicar la misma asignación dentro de ella.
- Los índices cubren las claves foráneas y consultas previstas de sucursal, asignación RBAC y auditoría.

## Validación de aislamiento

`apps/api/test/integration/user-role-isolation.test.mjs` crea dos organizaciones, sus sucursales, una identidad y un rol dentro de una transacción que siempre se revierte. La prueba confirma que dos asignaciones organizacionales y una asignación por sucursal válidas son aceptadas, mientras que una asignación que combina la organización A con la sucursal B es rechazada por la FK compuesta. Tras la prueba, los conteos técnicos permanecieron en `0 users`, `0 roles` y `0 user_roles`.

## Datos demostrativos

El seed es idempotente y solo conserva:

- Organización `restaurant-os-demo`.
- Sucursal `demo-central`, zona `America/Mexico_City`.

No crea usuarios, roles, permisos, credenciales, pedidos, productos, pagos, mesas, tickets, CFDI, datos reales ni información personal.

## Fuera de alcance

Las políticas concretas de roles/permisos, autenticación, sesiones, auditoría de operaciones, empleados, menú, mesas, pedidos, cocina, pagos, caja, facturación y demás módulos comerciales siguen pendientes de fases autorizadas posteriores.
