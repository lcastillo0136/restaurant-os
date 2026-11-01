# RBAC inicial — propuesta para aprobación

Esta matriz no siembra datos ni concede acceso. Mantiene denegación por defecto y separación por `organization_id`/`branch_id`.

| Perfil de análisis | Alcance propuesto | Capacidades administrativas candidatas | Excluido hasta módulos/políticas aprobados |
| --- | --- | --- | --- |
| Administrador de organización | Organización; sucursal sólo al seleccionar un recurso | usuarios/roles, organización/sucursales, auditoría, configuración técnica | pedidos, cocina, caja, descuentos, cancelaciones, cobros |
| Administrador de sucursal | Sucursal exacta | usuarios de sucursal, dispositivos, auditoría local, configuración de sucursal | administración de otras sucursales y todas las operaciones comerciales pendientes |
| Operador de restaurante | Sucursal y turno autorizados | ninguna capacidad administrativa por defecto | creación de usuarios/roles, auditoría, configuración, operación comercial no aprobada |
| Personal sin permisos administrativos | Ninguno | ninguna | todo acceso administrativo y comercial |

Para el primer administrador, el propietario debe aprobar un código de rol estable y una lista cerrada de permisos. La CLI exige coincidencia exacta con los permisos activos existentes para evitar ampliaciones silenciosas. No se reutilizará `auth.session.read` como privilegio administrativo: sólo es una capacidad técnica usada por pruebas de fundamentos.

Faltan decisión y ADR aprobada para códigos concretos, asignaciones, separación por estación/turno, cambios de rol, descuentos, cancelaciones y cierre de caja. Hasta entonces no se crean roles, permisos ni asignaciones reales.
