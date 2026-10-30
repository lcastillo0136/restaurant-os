# Flujo Git y publicación

## Convenciones aprobadas

- Rama principal: `Master`.
- Desarrollo: `feature/*`.
- Correcciones: `fix/*`.
- Integración: Pull Request revisado hacia `Master`.
- Etiquetas aprobadas son inmutables; no se reescribe historial publicado.

## Líneas base de diseño

- `design-v0.5-approved`: línea base aprobada de las Fases 0.1 a 0.5, commit `d984203a467c1a1a2329b6b569510dc0c0213955`.
- `design-v0.7.1-approved`: cierre completo y aprobado de las Fases 0.1 a 0.7.1, merge commit `024975e0311140df79c0be201ac2c590ce6c7155`.

Ambas etiquetas son anotadas, publicadas e inmutables.

## Repositorio publicado

- URL pública: `https://github.com/lcastillo0136/restaurant-os`.
- Remoto SSH: `git@github.com:lcastillo0136/restaurant-os.git` (`origin`).
- Rama principal y predeterminada: `Master`.
- Commit inicial aprobado: `d984203a467c1a1a2329b6b569510dc0c0213955`.
- Integración de Fase 0.6: Pull Request #1, merge commit `fada2e961cd15ae886ac719d8458afcd962653d7`.
- Cierre de Fase 0: Pull Request #2, merge commit `024975e0311140df79c0be201ac2c590ce6c7155`.
- Etiquetas anotadas publicadas: `design-v0.5-approved` y `design-v0.7.1-approved`.
- Rama local preparada para la siguiente etapa: `feature/phase-1-foundation`, creada desde el cierre de Fase 0 y no publicada.

La rama local de la siguiente etapa solo representa preparación de trabajo; no autoriza iniciar Fase 1 ni implementar módulos funcionales.

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
