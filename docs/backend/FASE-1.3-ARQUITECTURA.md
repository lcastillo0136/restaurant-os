# Fase 1.3 — Arquitectura del núcleo NestJS

Fecha de implementación: 2026-10-31. Esta fase entrega infraestructura compartida; no implementa módulos comerciales.

## Estructura real

| Ubicación | Responsabilidad |
| --- | --- |
| `apps/api/src/main.ts` | Bootstrap, prefijo `/api/v1`, middleware, pipes, filtro e interceptor globales. |
| `apps/api/src/common/dto/` | DTO reutilizable de paginación futura; no expone recursos de negocio. |
| `apps/api/src/common/http/` | Contexto de solicitud, encabezados, límite de cuerpo, validación, errores y logging seguro. |
| `apps/api/src/database/` | Adaptador Prisma centralizado, endpoint técnico de readiness y ciclo de cierre. |
| `apps/api/src/system.controller.ts` | Liveness y estado técnico sin datos sensibles. |

El backend continúa como monolito modular. No se crearon controladores, servicios ni archivos vacíos para pedidos, pagos, cocina, caja u otros módulos futuros.

## Flujo HTTP

1. Se genera un `x-request-id` y se añaden encabezados de seguridad antes del parser JSON.
2. Express limita y parsea JSON; un cuerpo excesivo recibe error seguro `413`.
3. Nest aplica `ValidationPipe` global con transformación controlada, whitelist y rechazo de propiedades adicionales.
4. El controlador usa servicios; los controladores no contienen acceso directo a Prisma.
5. Al terminar la respuesta, el interceptor registra una sola vez solo método, ruta sin query, estado final, duración e identificador de solicitud.
6. El filtro global normaliza excepciones y nunca devuelve trazas, consultas, variables ni cadenas de conexión.

## Prisma

`PrismaService` es el único punto de acceso base. Se inicializa dentro del ciclo NestJS en modo de conexión diferida: el proceso puede responder liveness sin una consulta a PostgreSQL y `GET /system/database` realiza el `SELECT 1` de readiness. Al cerrar la aplicación, `onModuleDestroy` desconecta el cliente.

No se modificó `schema.prisma`, no se creó migración ni se escribió dato alguno en `restaurant_dev`. La prueba aislada de readiness ejecutó únicamente `SELECT 1` mediante NestJS y Prisma.
