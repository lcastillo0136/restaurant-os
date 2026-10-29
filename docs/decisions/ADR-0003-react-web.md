# ADR-0003 — React para interfaces web de escritorio

**Estado:** APROBADO. Trazabilidad: fuente de verdad y `docs/01-ARQUITECTURA.md`.

## Decisión

Administración y POS usan React/TypeScript; el KDS de monitor puede usar React. Los clientes web comparten tokens y contratos, no lógica comercial.

## Consecuencias

El scaffold web no simula operaciones transaccionales ni sustituye los clientes Flutter previstos para tabletas.
