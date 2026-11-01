# Fase 2.1 — Estrategia de preparación operativa y persistencia

**Estado:** preparada para revisión; no operada contra PostgreSQL.
**Fecha:** 2026-11-01.

## Diagnóstico estático

El modelo Prisma ya contiene `organizations`, `branches`, `users`, `user_credentials`, `auth_sessions`, roles/permisos, asignaciones con `organization_id`/`branch_id`, auditoría técnica y `security_audit_events`. Las credenciales usan Argon2id; las sesiones persistidas guardan hashes SHA-256 de tokens opacos y sus expiraciones/revocación. `AuthorizationGuard` deniega por defecto y comprueba organización/sucursal activas.

Existen tres migraciones versionadas. La tercera, `20261101000100_authentication_authorization`, añade credenciales, sesiones y auditoría de seguridad. Su existencia en el árbol **no prueba** que esté aplicada: esta fase no consultó el estado de ninguna base. No se modificó una migración aprobada ni se creó una nueva.

La configuración habitual de desarrollo resuelve `DATABASE_URL` para `restaurant_dev`. Esa base está expresamente excluida del bootstrap de Fase 2.1 y de todas las operaciones de esta entrega.

## Entregable técnico

`apps/api/src/bootstrap/first-admin.cli.ts` es una CLI local, sin ruta HTTP pública. Antes de abrir una conexión exige:

1. `FIRST_ADMIN_DATABASE_URL` suministrada sólo al proceso, no desde `.env`.
2. `--target-name` idéntico al nombre de base de la URL y distinto de `restaurant_dev`.
3. referencia de autorización no secreta, confirmación ligada al destino y confirmación interactiva final.
4. terminal interactiva para identificador, nombre opcional y contraseña; la contraseña no se acepta como argumento, archivo ni salida.
5. un rol activo ya creado cuya lista de permisos activos coincida exactamente con la lista aprobada y declarada. La CLI no siembra roles ni permisos.

El aprovisionador abre una transacción `Serializable` y toma un advisory lock PostgreSQL. Sólo continúa si hay cero identidades; crea la identidad `LOCAL`, hash Argon2id, una única asignación de rol con organización y sucursal si aplica, y un evento `ADMIN_BOOTSTRAP` sin contraseña, token ni URL. Las ejecuciones repetidas o simultáneas se rechazan.

No hay actualmente matriz RBAC definitiva aprobada ni datos RBAC sembrados. Por ello la CLI está implementada pero no está autorizada para ejecutarse: el rol y los permisos a proporcionar deberán provenir de una aprobación posterior.

## Límites y riesgos

- Una bandera o referencia de autorización sólo registra intención técnica; no sustituye la autorización humana del propietario.
- La transacción, las FKs, la migración pendiente, login persistido, rotación, revocación y restauración requieren una base temporal autorizada para ser probadas físicamente.
- Aún deben aprobarse retención, acceso, exportación y respuesta a incidentes para la auditoría de seguridad.

Consulte [Migraciones seguras](MIGRACIONES-SEGURAS.md), [primer administrador](PRIMER-ADMINISTRADOR.md), [RBAC inicial](RBAC-INICIAL-PROPUESTA.md), [backup y restauración](BACKUP-RESTAURACION.md) y [pruebas diferidas](PRUEBAS-PENDIENTES-AUTORIZACION.md).
