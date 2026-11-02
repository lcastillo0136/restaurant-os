# Fase 2.3 — Empleados y turnos

## Modelo preparado

La migración incremental `20261101000200_employees_work_shifts` y el esquema añaden `Employee`, `EmployeeBranchAssignment`, `WorkShift` y `WorkShiftAssignment`. Un empleado pertenece a una organización, puede no tener usuario y no obtiene RBAC; las asignaciones laborales y los turnos fechados se mantienen separados de sesiones y caja. Las restricciones impiden códigos repetidos por organización y asignar dos veces un empleado al mismo turno.

## Estado y límites

La migración no fue aplicada ni validada contra PostgreSQL. La revisión añadió FKs compuestas para que empleado/sucursal/turno compartan organización, una restricción SQL `scheduled_end > scheduled_start` y unicidad de asignación. La vigencia por estado de asignación no puede expresarse con una FK ordinaria: deberá validarse transaccionalmente en servicios y comprobarse contra PostgreSQL temporal. El vínculo de escritura con `AppUser`, servicios/endpoints de empleados y turnos, autorización y auditoría transaccional permanecen bloqueados: requieren completar los contratos y pruebas focalizadas antes de recomendar aprobación. No se creó ningún empleado, turno, usuario ni dato real.

## Evidencia

`pnpm --filter @restaurant-os/api build` pasó tras generar el cliente Prisma de forma estática. `test:phase-2.3` valida el inventario del esquema sin conexión a base.
