# RBAC y alcances

## Motor implementado

`AuthorizationService` obtiene roles activos, permisos activos y `user_roles.organization_id` desde PostgreSQL. `AuthorizationGuard` deniega por defecto y requiere ambos decoradores:

```ts
@UseGuards(AuthGuard, AuthorizationGuard)
@RequirePermissions('tables.open')
@RequireAuthorizationScope({ organizationParam: 'organizationId', branchParam: 'branchId' })
```

El valor de ruta solo selecciona el ámbito candidato; nunca concede autoridad. Una asignación `ORGANIZATION` concede un permiso en la organización exacta. Una asignación `BRANCH` exige además la sucursal exacta. La FK compuesta de Fase 1.2 ya prueba que esa sucursal pertenece a la organización de la asignación.

No hay endpoints comerciales protegidos ficticiamente en esta fase. Los futuros controladores deben usar el guard, no reglas repartidas en cada acción.

## Matriz inicial — propuesta pendiente

Los perfiles aprobados visualmente son Administrador, Gerente, Cajero, Mesero, Chef y Auxiliar de cocina. Los contratos de interfaz incluyen, entre otros, `tables.open`, `menu.manage`, `employees.manage`, `cash.open`, `cash.close`, `payments.cash`, `tickets.reprint`, `devices.release`, `reports.read` y `audit.read`.

No se sembraron roles ni permisos, ni se concedió acceso universal. La política concreta de asignación por perfil, sucursal, turno, estación, descuentos, cancelaciones y cierres requiere aprobación del propietario antes de habilitar módulos comerciales. El único permiso técnico utilizado en pruebas aisladas es `auth.session.read`; tampoco se insertó en la base local.
