# Migraciones PostgreSQL

## Configuración local

La credencial vive exclusivamente en `.env.database`, ignorado por Git. La variable requerida es `DATABASE_URL` y debe apuntar a `restaurant_app` en `127.0.0.1:5432/restaurant_dev?schema=public`.

Los caracteres reservados de la contraseña se codifican en URL; por ejemplo, `+`, `}` y `\` se escriben como `%2B`, `%7D` y `%5C` respectivamente. El archivo `.env.example` contiene solo un placeholder.

## Comandos operativos

Desde la raíz del repositorio:

```powershell
pnpm --filter @restaurant-os/api db:migrate:status
pnpm --filter @restaurant-os/api db:migrate:deploy
pnpm --filter @restaurant-os/api db:seed
```

`db:migrate:deploy` aplica exclusivamente migraciones ya versionadas. `db:seed` se puede ejecutar repetidamente: actualiza por código los dos registros ficticios sin crear duplicados.

## Primera migración

`20261031000100_initial_foundation` crea las estructuras de organización, sucursal, identidad sin contraseñas, RBAC y auditoría técnica. Se generó mediante `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`, se revisó y se aplicó con `prisma migrate deploy`.

No se utiliza `prisma migrate dev` contra `restaurant_dev`: ese comando requiere una base sombra y privilegios de creación globales que la cuenta de aplicación no posee ni necesita.

## Aislamiento de asignaciones RBAC

`20261031000200_user_roles_organization_isolation` es una migración incremental. Añade `organization_id` obligatorio a `user_roles`, la FK de organización y la FK compuesta que vincula cada sucursal con esa organización. También ajusta la unicidad de asignación para que una misma identidad pueda tener el mismo rol en organizaciones distintas sin cruzar su alcance. No modifica la migración inicial ni datos existentes; la base de Fase 1.2 no contiene asignaciones de rol.

## Cambios futuros

1. Diseñar el cambio aprobado en `schema.prisma`.
2. Generar y revisar el SQL contra una base vacía o una base sombra aislada autorizada.
3. Agregar una nueva carpeta de migración; nunca editar una migración que ya fue aplicada.
4. Ejecutar `db:migrate:status`, aplicar con `db:migrate:deploy` y probar solo el módulo afectado.

No ejecutar `prisma migrate reset`, no eliminar volúmenes ni borrar bases de datos existentes.
