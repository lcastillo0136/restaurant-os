# Fase 1.6 — Estrategia de pruebas de integración

Fecha: 2026-11-01. Alcance: fundamentos NestJS, Prisma, autenticación, RBAC, REST técnico y Socket.IO; no incluye operaciones comerciales, migraciones aplicadas, LAN física ni dispositivos.

## Objetivo

El conjunto `pnpm test:integration:api` concentra los riesgos donde interactúan módulos reales. Usa servicios de producción compilados (`AuthService`, `SessionService`, `AuthorizationService`, guards, `RealtimeGateway` y controladores), con un repositorio Prisma ficticio en memoria. Esta decisión permite probar ciclo de vida, revocación y aislamiento sin escribir en `restaurant_dev`.

## Niveles diferenciados

| Nivel | Ejecutado | Alcance y límite |
| --- | --- | --- |
| Integración de módulos en memoria | Sí | Prueba colaboración entre servicios reales; no demuestra Prisma/PostgreSQL real. |
| HTTP loopback efímero | Sí | Comprueba bootstrap, health, CORS/preflight y límite JSON; no consulta la base. |
| Verificación estática Prisma | Sí | Genera el cliente y confirma migraciones versionadas; no aplica ni consulta migraciones. |
| PostgreSQL temporal | No | Requiere autorización separada para crear/modificar/eliminar una base aislada. |
| LAN, TLS/WSS, Android y WAN | No | Requiere red, certificados, dispositivos y autorización específica. |

## Comando reproducible

```powershell
pnpm test:integration:api
```

El comando delega en `@restaurant-os/api test:integration:foundation`, ejecuta build API y solo cinco archivos de integración: disposición de migraciones, ciclo de autenticación, ciclo WebSocket, health/CORS y límite de payload. No ejecuta React, Flutter, Android, CI, Docker, migraciones ni pruebas de PostgreSQL local.

Los fixtures generan UUIDs por ejecución, usan una passphrase exclusiva de prueba y conservan solamente hashes de tokens en memoria. No contienen datos personales, credenciales de propietario ni secretos de producción.

## Criterio de recomendación

La fase puede recomendarse para revisión cuando el comando focalizado pase, no haya secretos en el conjunto publicable y las limitaciones de PostgreSQL real/red física queden documentadas. Un resultado con mocks no se presenta como evidencia de conexión persistida, restauración, TLS real ni operación multi-dispositivo.
