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

## Autenticación (Fase 1.4)

| Ruta | Método | Protección | Contrato seguro |
| --- | --- | --- | --- |
| `/api/v1/auth/login` | `POST` | Pública con límite local | Recibe `identifier` y `password`; responde usuario seguro, token de acceso y token de renovación con sus expiraciones. Credenciales inválidas y usuario suspendido devuelven el mismo `401`. |
| `/api/v1/auth/refresh` | `POST` | Pública con límite local | Recibe solo `refreshToken`; rota ambos tokens y rechaza reutilización, revocación o expiración con `401`. |
| `/api/v1/auth/logout` | `POST` | Bearer de acceso vigente | Revoca la sesión actual y responde `204`. |
| `/api/v1/auth/me` | `GET` | Bearer de acceso vigente | Devuelve la identidad segura y asignaciones RBAC resueltas por el servidor. |

Los tokens, hashes, contraseñas y cabeceras de autorización no se registran ni se incluyen en errores. Los clientes no declaran como autoridad el rol, organización o sucursal: los guards consultan las asignaciones persistidas.
