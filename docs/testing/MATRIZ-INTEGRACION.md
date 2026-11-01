# Matriz de integración — Fase 1.6

| Escenario | Componentes reales | Método | Resultado esperado | Clasificación |
| --- | --- | --- | --- | --- |
| Migraciones versionadas | Prisma schema y directorios de migración | Lectura estática + `prisma generate` | Tres migraciones de fundamento presentes; ninguna ejecutada. | Ejecutada, estática |
| Login y ciclo de sesión | Password, Auth, Session, auditoría y controlador | Fixture Prisma en memoria | Login, identidad, refresh rotado y logout revocado. | Ejecutada, módulos |
| Credenciales inválidas/usuario deshabilitado/límite | Auth y rate limiter | Fixture en memoria | `401` uniforme y `429` al superar límite. | Ejecutada, módulos |
| RBAC por sucursal | AuthGuard, AuthorizationGuard y AuthorizationService | Fixture en memoria | Solo grant activo de organización/sucursal válida autoriza. | Ejecutada, módulos |
| WebSocket autorizado y ajeno | Auth, Authorization, RealtimeGateway y contratos | Transporte Socket.IO aislado | Handshake válido; suscripción ajena denegada. | Ejecutada, módulos |
| Revocación y reconexión | Session, Authorization y RealtimeGateway | Fixture en memoria | Sala revocada abandonada; reconexión no duplica sala. | Ejecutada, módulos |
| Fallos temporales simulados | Repositorios de sesión/autorización y gateway | Fixture en memoria | Desconexión segura con código canónico; sin secretos. | Ejecutada, módulos |
| REST técnico y CORS | Bootstrap Nest/Express | Proceso loopback efímero | Health, preflight `POST` permitido y origen no autorizado sin CORS. | Ejecutada, loopback |
| Límite HTTP | Middleware, filtro y request ID | Proceso loopback efímero | `413` uniforme con encabezados y request ID. | Ejecutada, loopback |
| Readiness contra PostgreSQL | PrismaService y `/system/database` | Base temporal aislada | Éxito y error de conexión reales. | Diferida, autorización |
| TLS/WSS/LAN/Android/WAN | Red, certificados y clientes físicos | Dispositivos autorizados | Autenticación, reconexión y aislamiento físico. | Diferida, física |

La matriz no introduce permisos comerciales, tablas, migraciones ni eventos de negocio. La autoridad de organización, sucursal, rol y permiso siempre procede del repositorio simulado del servidor, nunca de valores declarados por el cliente.
