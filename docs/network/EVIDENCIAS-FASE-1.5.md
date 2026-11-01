# Evidencias técnicas — Fase 1.5

Fecha: 2026-11-01. Las pruebas se ejecutaron contra mocks y procesos efímeros de loopback; no se aplicaron migraciones, no se modificaron datos ni se conectó PostgreSQL local.

| Comando | Resultado real |
| --- | --- |
| `pnpm --filter @restaurant-os/api typecheck` | Correcto tras alinear los paquetes Socket.IO de NestJS con 11.2.8. |
| `pnpm --filter @restaurant-os/api test:realtime` | Correcto: build API y 15 pruebas focalizadas superadas. |
| `pnpm audit --prod --audit-level high` | Correcto: sin vulnerabilidades conocidas de producción. |

Cobertura focalizada: configuración loopback/TLS/limites, contrato versionado, `Origin`, token en query, conexión autorizada/no autorizada, sesiones expirada y revocada, suscripción autorizada, organización/sucursal incongruente, mensaje excesivo, límite de conexiones, limpieza/revalidación, health REST y error HTTP 413 con encabezados.

No se repitieron pruebas React, Flutter, Android ni la suite completa de API porque no se modificaron. No se ejecutó GitHub Actions, no se realizó prueba física LAN/WSS/WAN y no se declara ninguna de ellas como superada.
