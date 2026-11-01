# Evidencias — Fase 1.6

Fecha de ejecución: 2026-11-01.

| Comando | Resultado real |
| --- | --- |
| `pnpm test:integration:api` | Correcto: build API, generación Prisma estática y 7/7 pruebas focalizadas. |

Escenarios superados: disposición de migraciones, login/guard/identidad/refresh/logout/RBAC/auditoría, rechazo seguro y rate limit, conexión WebSocket, aislamiento de sucursal, revocación de permiso, reconexión sin duplicación, revocación de sesión, fallo de repositorio de permisos, health/CORS/preflight `POST` y `413` con request ID.

No se detectaron defectos que requirieran corrección funcional. No se repitieron suites React, Flutter, Android, visuales ni GitHub Actions. No se aplicaron migraciones, no se accedió a PostgreSQL local, no se modificaron servicios, red, certificados ni credenciales.

Las pruebas de módulos usan fixture Prisma en memoria; los dos checks HTTP usan procesos NestJS de loopback efímeros. Ninguna de estas evidencias se interpreta como prueba de PostgreSQL real, restauración, TLS/WSS, LAN, Android o WAN.
