# Contratos técnicos de API

Prefijo común: `/api/v1`. Las rutas futuras usarán nombres plurales, métodos HTTP semánticos, UUID en parámetros y DTO validados; filtros, ordenamiento y paginación deberán reutilizar la convención `page`, `limit` (máximo 100) y `order` (`asc` o `desc`) cuando proceda.

| Método y ruta | Finalidad | Respuesta |
| --- | --- | --- |
| `GET /system/health` | Liveness del proceso; no consulta PostgreSQL. | `200` con servicio, estado y fase. |
| `GET /system/status` | Estado técnico mínimo de la fundación. | `200` sin configuración ni datos internos. |
| `GET /system/database` | Readiness técnica; ejecuta una consulta liviana a PostgreSQL. | `200` si la dependencia responde; error seguro si no. |

Todas las respuestas incluyen `x-request-id`. No se introdujo una envoltura de éxito para conservar compatibilidad con los contratos técnicos existentes.

## Errores

Los errores tienen `statusCode`, `code`, `message`, `requestId`, `timestamp` y `path`. Solo los errores de validación incorporan `details` con nombre de campo y reglas incumplidas. No hay endpoints comerciales ni documentación OpenAPI interactiva: la documentación estática describe exclusivamente estas rutas reales.
