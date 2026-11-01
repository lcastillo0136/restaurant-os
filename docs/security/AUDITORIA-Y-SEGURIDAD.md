# Auditoría y seguridad

`security_audit_events` reutiliza el patrón inmutable de auditoría de Fase 1.2, pero es una tabla separada porque un intento de login puede no conocer todavía usuario, organización, sucursal o entidad de negocio. Evita inventar UUID, organización o entidad para un fallo anónimo.

Registra, si la persistencia está disponible, evento, resultado, fecha, `requestId` y actor/organización/sucursal cuando se conocen. Los eventos implementados son `AUTH_LOGIN`, `AUTH_REFRESH` y `AUTH_LOGOUT`, con resultado `SUCCESS`, `FAILURE`, `RATE_LIMITED` o `REVOKED`.

Nunca se persisten ni loguean contraseñas, tokens, hashes de contraseña, hashes de tokens, encabezados, cuerpos, secretos o cadenas de conexión. Si la auditoría falla, la operación de autenticación no expone detalles ni revierte por una falla secundaria; se emite solo un aviso técnico seguro con tipo de evento y `requestId`.

La retención, acceso de lectura, exportación, revisión de eventos de cambios de roles/permisos y tratamiento de incidentes permanecen pendientes de política aprobada.
