# ADR-0004 — Operación local primero

**Estado:** APROBADO. Trazabilidad: ADR-001 en `docs/07-ADR.md`.

## Decisión

La operación esencial usa LAN privada: servidor, PostgreSQL, clientes, tickets y efectivo. Los servicios externos para tarjetas, PAC/CFDI y actualizaciones son posteriores y degradan de forma explícita si no hay internet.

## Consecuencias

Sin servidor o LAN, los clientes pueden mostrar estado o caché, pero no confirmar transacciones. La sincronización multisucursal queda pospuesta.
