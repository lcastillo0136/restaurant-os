# Backup y restauración — procedimiento preparado

No se generaron, leyeron ni restauraron respaldos en Fase 2.1.

## Respaldo antes de cambios autorizados

1. El operador identifica por escrito el destino, propietario y ubicación nueva del respaldo; confirma que no sobrescribirá un archivo existente.
2. Ejecuta una herramienta revisada para ese destino con credenciales fuera de Git y sin imprimirlas. No reutilizar `Backup-RestaurantDev.ps1` para otra base sin adaptar y aprobar sus protecciones.
3. Registra hash SHA-256, tamaño, hora, versión de `pg_dump` y migraciones esperadas; guarda los metadatos sin URL/credenciales.
4. Ejecuta `pg_restore --list <archivo>` y comprueba que el catálogo sea legible. Esta verificación no restaura datos.

## Restauración de recuperación

1. Detener el cambio y preservar evidencia cuando falle una migración o comprobación.
2. Obtener autorización explícita para una base **nueva, vacía y aislada**, incluido su nombre y responsable. No restaurar sobre `restaurant_dev`, la fuente ni producción.
3. Ejecutar `pg_restore --no-owner --no-privileges --dbname <destino-nuevo> <respaldo>` con la cuenta y la URL administradas por el propietario.
4. Verificar lectura de migraciones, FKs, índices, conteos previstos y acceso de mínimo privilegio. No declarar recuperación satisfactoria sólo por retorno cero de `pg_restore`.
5. Documentar resultado y retención. La eliminación de la base temporal exige autorización independiente y no está automatizada.

## Pendientes de política

Quedan por aprobar retención/cifrado/ubicación de backups, quién puede restaurar, frecuencia, objetivos RPO/RTO, pruebas de recuperación, exportación y respuesta a incidentes. Este documento no fija tales valores.
