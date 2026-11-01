# Evidencias — Fase 2.1

## Cambios preparados

- CLI local de bootstrap en `apps/api/src/bootstrap/`, sin endpoint HTTP ni carga de `.env`.
- Pruebas unitarias en memoria de éxito controlado, exclusión concurrente, permisos exactos, entradas inseguras y bloqueo de `restaurant_dev`.
- Procedimientos de migración, backup/restore, RBAC propuesto y operaciones diferidas en esta carpeta.

## Pruebas ejecutadas

| Comando | Resultado real | Alcance |
| --- | --- | --- |
| `pnpm --filter @restaurant-os/api test:phase-2.1` | Correcto: build Prisma/Nest y 6/6 pruebas | Repositorio ficticio en memoria; no abre PostgreSQL. Incluye rechazo de `--branch-id` duplicado, lectura oculta por bloques/restauración de TTY y ocultamiento de errores internos. |

No se ejecutaron la batería general, React, Flutter, Android, GitHub Actions, migraciones, backup, restore, conexiones a PostgreSQL ni la CLI de bootstrap.

## Límites

La migración `20261101000100_authentication_authorization` no se trató como aplicada por existir en el repositorio. No hay administrador real ni roles/permisos reales. Las operaciones persistidas, red/TLS y dispositivos siguen diferidas según `PRUEBAS-PENDIENTES-AUTORIZACION.md`.
