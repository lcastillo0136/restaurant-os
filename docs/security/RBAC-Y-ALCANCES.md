# RBAC y alcances

## Motor implementado

`AuthorizationService` obtiene roles y permisos activos, además de organización y sucursal activas, desde PostgreSQL. `AuthorizationGuard` deniega por defecto: rechaza permisos ausentes o vacíos, metadatos de alcance incompletos, parámetros faltantes y cualquier grant incongruente. `RequirePermissions` instala automáticamente `AuthGuard` y `AuthorizationGuard`, de modo que un futuro controlador que declare permisos no puede olvidar activar ambos guards.

```ts
@RequirePermissions('tables.open')
@RequireAuthorizationScope({ organizationParam: 'organizationId', branchParam: 'branchId' })
```

El valor de ruta solo selecciona el ámbito candidato; nunca concede autoridad. Cuando una solicitud incluye `branchId`, el servidor hace una única comprobación indexada de que esa sucursal existe, está activa y pertenece al `organizationId` solicitado antes de resolver grants. Esta comprobación también es obligatoria para una asignación `ORGANIZATION`; sin `branchId`, el acceso organizacional válido se conserva. Una asignación `BRANCH` exige además la sucursal exacta, activa y perteneciente a la organización activa de la asignación. La FK compuesta de Fase 1.2 ya prueba esa relación; el servicio la vuelve a comprobar defensivamente al construir grants.

No hay endpoints comerciales protegidos ficticiamente en esta fase. Los futuros controladores deben usar el guard, no reglas repartidas en cada acción.

## Matriz inicial — propuesta pendiente

Los perfiles aprobados visualmente son Administrador, Gerente, Cajero, Mesero, Chef y Auxiliar de cocina. Los contratos de interfaz incluyen, entre otros, `tables.open`, `menu.manage`, `employees.manage`, `cash.open`, `cash.close`, `payments.cash`, `tickets.reprint`, `devices.release`, `reports.read` y `audit.read`.

No se sembraron roles ni permisos, ni se concedió acceso universal. La política concreta de asignación por perfil, sucursal, turno, estación, descuentos, cancelaciones y cierres requiere aprobación del propietario antes de habilitar módulos comerciales. El único permiso técnico utilizado en pruebas aisladas es `auth.session.read`; tampoco se insertó en la base local.
