# ADR-0001 — Monolito modular local

**Estado:** APROBADO. Trazabilidad: ADR-001 y ADR-003 en `docs/07-ADR.md`.

## Contexto

La operación esencial debe continuar en LAN sin una dependencia cloud obligatoria.

## Decisión

Un servidor local con NestJS modular, PostgreSQL único, REST/WebSocket y proxy HTTPS local. No se implementan microservicios en el MVP.

## Consecuencias

La BD es la autoridad transaccional; los clientes nunca confirman pedidos o cobros sin ACK del servidor.
