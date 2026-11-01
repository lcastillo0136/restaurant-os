# Manifiesto de revisión — Fase 1.4

El paquete `restaurant-os-fase-1.4-revision.zip` incluye únicamente código NestJS de autenticación/autorización/auditoría, esquema Prisma, migración incremental sin aplicar, configuración sin secretos, pruebas focalizadas y documentación de Fase 1.4.

Se excluyen `.env` reales, contraseñas, tokens, bases, respaldos, `node_modules`, `dist`, cachés, binarios y referencias visuales privadas.

Evidencia técnica: generación Prisma y build de API correctos; 10 pruebas aisladas de autenticación, 5 pruebas RBAC, 3 comprobaciones finales de aislamiento y 2 tests HTTP de loopback correctos. Estas cubren Argon2id, login, usuario suspendido, rate limiting, tokens manipulados/expirados, rotación/revocación, configuración, auditoría segura, denegación de política/alcance/organización/sucursal inválidos y validación de una sucursal solicitada incluso con grant organizacional. El primer run CI detectó y la corrección resolvió inyección accidental de perfiles opcionales como dependencias Nest. No se ejecutaron migraciones ni operaciones contra PostgreSQL local.
