# Migraciones seguras

Estas instrucciones son un procedimiento para el propietario autorizado. Ninguno de sus comandos fue ejecutado en Fase 2.1.

## Separación obligatoria de entornos

| Entorno | Permitido en esta fase | Regla |
| --- | --- | --- |
| Revisión estática | Sí | Leer schema, SQL y documentación sin conectar a PostgreSQL. |
| Base temporal aislada | No, hasta autorización específica | Debe tener nombre nuevo, propietario responsable y plan de eliminación autorizado. |
| `restaurant_dev` | No | No aplicar, verificar ni consultar en esta fase. |
| Producción futura | No | Requiere procedimiento, respaldo, ventana y responsable aprobados. |

## Procedimiento autorizado futuro

1. Registrar autorización, objetivo exacto, responsable, hora y migraciones que se evaluarán.
2. Confirmar por medios del propietario que el destino no es `restaurant_dev` ni producción.
3. Crear un respaldo con nombre y ruta explícitos; nunca sobrescribir uno existente. El script histórico `infra/postgres/Backup-RestaurantDev.ps1` sólo sirve para el flujo antiguo de `restaurant_dev`; no debe reutilizarse para una base temporal sin revisión previa.
4. Validar el archivo con `pg_restore --list` y conservar hash SHA-256, tamaño, fecha y resultado sin divulgar URL ni contraseña.
5. Ejecutar `pnpm --filter @restaurant-os/api db:migrate:status` sólo contra el destino autorizado y guardar su salida como evidencia privada.
6. Comparar las migraciones pendientes con el SQL versionado. La carpeta `20261101000100_authentication_authorization` es incremental; nunca editarla si ya existe historial aplicado.
7. Evaluar FKs, índices, bloqueo, respaldo y reversión antes de aplicar. Para una corrección, crear una migración incremental aprobada.
8. Sólo con autorización separada, usar `pnpm --filter @restaurant-os/api db:migrate:deploy`. No usar `prisma migrate dev` ni `prisma migrate reset`.
9. Confirmar el estado posterior, integridad referencial, conteos esperados y registro de migraciones. Anotar resultados, no secretos.
10. Ante fallo, detener el proceso. Restaurar exclusivamente sobre una base nueva y aislada conforme a [backup y restauración](BACKUP-RESTAURACION.md); no sobrescribir el origen.

## Evidencia mínima

- autorización y destino identificados sin credenciales;
- hash y lectura correcta del respaldo;
- estado previo y posterior de migraciones;
- versión/hash del SQL aplicado;
- resultados de integridad y pruebas focalizadas;
- decisión de continuar, recuperación o detención.
