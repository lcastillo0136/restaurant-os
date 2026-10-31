# Respaldo y recuperación técnica de PostgreSQL

## Respaldo local

El script usa `pg_dump` de PostgreSQL 17, toma la cuenta local desde `.env.database` sin imprimirla y crea un archivo custom fuera de Git:

```powershell
./infra/postgres/Backup-RestaurantDev.ps1
```

Para elegir el destino explícitamente:

```powershell
./infra/postgres/Backup-RestaurantDev.ps1 -OutputPath .tmp/fase-1.2/restaurant_dev.backup
```

El formato custom conserva esquema y datos y no altera `restaurant_dev`.

## Verificación sin restauración

```powershell
./infra/postgres/Test-RestaurantDevBackup.ps1 -BackupPath .tmp/fase-1.2/restaurant_dev.backup
```

La validación usa `pg_restore --list`, comprueba que el archivo se puede leer y que contiene la tabla fundacional `organizations`. No sobrescribe ninguna base.

## Restauración controlada

La restauración debe dirigirse exclusivamente a una base nueva y vacía de prueba, con autorización explícita del propietario. Nunca restaurar sobre `restaurant_dev` ni una base operativa.

1. Un administrador crea una base objetivo temporal vacía y confirma su nombre exacto.
2. Se restaura con `pg_restore --no-owner --no-privileges --dbname <base-temporal> <respaldo>`.
3. Se valida la migración y los conteos esperados.
4. La eliminación posterior de la base temporal requiere autorización explícita independiente.

La Fase 1.2 verificó la integridad del archivo de respaldo; no ejecutó una restauración física para no crear ni eliminar bases temporales sin autorización adicional.
