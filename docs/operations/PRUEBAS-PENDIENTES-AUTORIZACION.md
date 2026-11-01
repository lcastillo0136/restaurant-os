# Pruebas pendientes de autorización — Fase 2.1

| Prueba diferida | Requiere autorización porque | Resultado que se espera documentar |
| --- | --- | --- |
| Aplicar migraciones en PostgreSQL | Modifica una base temporal | estado previo/posterior y SQL versionado |
| Crear base temporal aislada | Crea recurso local | nombre, responsable y condición de limpieza |
| Integridad referencial real | Inserta datos de prueba | FKs, índices y aislamiento de organización/sucursal |
| Bootstrap persistido | Crea identidad, hash, rol y auditoría | precondiciones, éxito/fallo seguro y sin secretos |
| Login/refresh/logout persistidos | Crea/rota/revoca sesiones | hashes sin tokens y eventos de auditoría |
| Restauración PostgreSQL | Escribe una base nueva | catálogo, FKs, migraciones y conteos |
| Autorización con datos reales | Inserta RBAC aprobado | denegación por defecto y rechazo inter-organización |
| TLS/WSS y LAN | Usa red, certificados y dispositivos | origen rechazado, revocación y reconexión |
| Dispositivos y prueba sin WAN | Interactúa con hardware/red | procedimiento físico controlado |

Las pruebas en memoria de esta entrega no sustituyen ninguna fila de esta tabla.
