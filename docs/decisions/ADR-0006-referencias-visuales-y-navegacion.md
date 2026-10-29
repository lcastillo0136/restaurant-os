# ADR-0006 — Referencias visuales oficiales, navegación y temas

**Estado:** APROBADO el 29-10-2026 por instrucción expresa del propietario. Trazabilidad: ADR-009 en `docs/07-ADR.md`.

## Contexto

La documentación previa describía los PNG de `design/reference/` como reconstrucciones y mantenía una ambigüedad entre navbar superior y sidebar administrativo. Además, `design/tokens.json` duplicaba nombres y valores desactualizados frente a `design/tokens/`.

## Decisión

- Los cuatro PNG nombrados en `design/reference/` son la fuente de verdad visual oficial; no se sobrescriben ni sustituyen.
- Administración usa navegación principal horizontal superior; POS conserva navegación lateral compacta.
- Se aprueban las familias `admin-light`, `customer-warm`, `kitchen-dark` y `pos-light` como dirección estética.
- `design/tokens/` es la fuente única de valores; `design/tokens.json` pasa a ser manifiesto sin valores duplicados.

## Consecuencias

Los valores de tokens aún requieren validación visual. Los SHA-256 originales suministrados por el propietario coincidieron con los archivos locales durante la validación final de Fase 0.1; no se alteraron los PNG.
