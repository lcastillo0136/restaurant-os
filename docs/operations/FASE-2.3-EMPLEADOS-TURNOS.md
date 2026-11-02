# Fase 2.3 — Empleados y turnos

## Modelo preparado

La migración incremental `20261101000200_employees_work_shifts` y el esquema añaden `Employee`, `EmployeeBranchAssignment`, `WorkShift` y `WorkShiftAssignment`. Un empleado pertenece a una organización, puede no tener usuario y no obtiene RBAC; las asignaciones laborales y los turnos fechados se mantienen separados de sesiones y caja. Las restricciones impiden códigos repetidos por organización y asignar dos veces un empleado al mismo turno.

## Incremento funcional preparado

El módulo NestJS `employees` incorpora DTO con validación, controladores y un servicio transaccional para listar, consultar, crear y actualizar empleados; activar o desactivar empleados; asignarlos a una sucursal y desactivar o cancelar esa asignación; crear, consultar, reprogramar y cancelar turnos; y asignar, consultar o cancelar personal asignado a un turno. Los instantes de turno exigen UTC (`Z`) u offset explícito, por lo que no se persiste una hora local ambigua; la zona horaria de sucursal queda como referencia de presentación. Una reasignación vuelve a activar la misma relación y conserva el historial mediante el evento de auditoría. Las rutas están protegidas por los guards existentes y por permisos `employees.read`, `employees.manage`, `work-shifts.read` y `work-shifts.manage`, con alcance de organización y de sucursal cuando corresponde.

Cada mutación registra un `AuditEvent` dentro de la misma transacción. No existe ruta de escritura para vincular `Employee` y `AppUser`: esa decisión permanece bloqueada hasta aprobar la matriz RBAC definitiva y la política de identidad. Tampoco se introducen roles, permisos, usuarios, organizaciones, sucursales ni datos reales.

Los contratos quedan bajo `/api/v1/organizations/:organizationId`: `GET/POST /employees`, `GET/PATCH /employees/:employeeId` y `PATCH /employees/:employeeId/status`. Bajo `/api/v1/organizations/:organizationId/branches/:branchId`: `GET /employees`, `POST /employees/:employeeId/assignments`, `PATCH /employees/:employeeId/assignments/status`, `GET/POST /work-shifts`, `GET/PATCH /work-shifts/:shiftId`, `PATCH /work-shifts/:shiftId/status`, `GET /work-shifts/:shiftId/assignments`, `POST /work-shifts/:shiftId/assignments/:employeeId` y `PATCH /work-shifts/:shiftId/assignments/:employeeId/status`.

## Estado y límites

La migración no fue aplicada ni validada contra PostgreSQL. La revisión añadió FKs compuestas para que empleado/sucursal/turno compartan organización, una restricción SQL `scheduled_end > scheduled_start` y unicidad de asignación. La vigencia por estado de asignación no puede expresarse con una FK ordinaria: deberá validarse transaccionalmente en servicios y comprobarse contra PostgreSQL temporal. La prevención de solapamientos de turnos, pruebas HTTP integrales de guards, prueba transaccional con PostgreSQL temporal y la política definitiva de vínculo `Employee`–`AppUser` siguen pendientes. No se creó ningún empleado, turno, usuario ni dato real.

## Evidencia

`pnpm --filter @restaurant-os/api build` pasó tras generar el cliente Prisma de forma estática. `pnpm --filter @restaurant-os/api test:phase-2.3` pasó 10/10 con fixture transaccional en memoria: inventario de esquema, creación auditada, rollback ante fallo simulado de auditoría, aislamiento de organización, asignación laboral activa, empleado inactivo, reactivación sin duplicar, cancelación auditada de turno/asignación, periodo inválido, DTO reales y metadatos de guards. No es evidencia de PostgreSQL real ni de HTTP integral.
