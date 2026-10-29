# Flujo Git y publicación

## Convenciones aprobadas

- Rama principal: `Master`.
- Desarrollo: `feature/*`.
- Correcciones: `fix/*`.
- Integración: Pull Request revisado hacia `Master`.
- Etiquetas aprobadas son inmutables; no se reescribe historial publicado.

## Línea base de diseño

La línea base aprobada de las Fases 0.1 a 0.5 se identifica mediante la etiqueta anotada `design-v0.5-approved`. La Fase 0.6 no forma parte de esta línea base.

## Lista previa a cada publicación

1. Confirmar rama y alcance.
2. Ejecutar pruebas y validadores aplicables.
3. Ejecutar `node scripts/audit-public-baseline.mjs` sobre el conjunto preparado.
4. Revisar `git diff --cached` y el inventario de archivos.
5. Confirmar que no se versionan secretos, datos personales, dependencias, builds, bases, respaldos o perfiles.
6. Confirmar procedencia y derecho de redistribución de cada recurso gráfico o fuente.
7. Publicar mediante Pull Request; no forzar actualizaciones.

## Material interno

Los cuatro PNG oficiales de `design/reference/` y los ZIP de revisión que los contienen se mantienen fuera de Git. Sus nombres y SHA-256 se documentan para verificar la fuente de verdad sin redistribuir los binarios.

## Licencia

No se seleccionó una licencia open source. Esta decisión requiere aprobación expresa del propietario y no se infiere de la visibilidad pública de GitHub.
