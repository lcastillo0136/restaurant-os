# Fase 2.6-A — Matriz de validación integral

Fecha de auditoría documental: 2026-11-02. Base auditada:
`b69437c67820a786aeca0d2654813075699967c2`
(`admin-panel-v2.5-approved`). Esta matriz no ejecuta pruebas ni conecta
servicios; los resultados históricos se identifican como tales.

## Convenciones de evidencia

- **VALIDADA**: existe evidencia de una ejecución previa identificada en la
  documentación de fase; no implica que se haya repetido en 2.6-A.
- **PENDIENTE**: la prueba es aplicable, pero no tiene evidencia suficiente o
  no se ejecutó en esta auditoría.
- **BLOQUEADA_POR_AUTORIZACION**: requiere PostgreSQL, migraciones, red, datos
  persistidos, dispositivos o una autorización que este bloque no concede.
- **NO_IMPLEMENTADA**: el módulo o flujo no forma parte de lo entregado.
- **NO_APLICA**: no corresponde al flujo estructural indicado.

## Inventario de módulos reales

| Módulo | Archivos principales y entidades | Permisos / endpoints | Estados y operaciones disponibles | Dependencias | Pruebas existentes y evidencia | Validaciones pendientes |
| --- | --- | --- | --- | --- | --- | --- |
| Organizaciones | `organizations.controller.ts`, `organizations.service.ts`, `Organization` | `organizations.read/manage`; `GET/PATCH /organizations/:organizationId` | Organización activa; lectura y actualización de nombre | Prisma, `AuthGuard`, `AuthorizationGuard`, auditoría | Fase 2.2: `test:phase-2.2` 4/4 histórico | PostgreSQL temporal, HTTP integral, RBAC sembrado |
| Sucursales | mismos archivos; `Branch` | `branches.read/manage`; `GET/POST /branches`, `GET/PATCH /branches/:branchId`, `PATCH .../status` | `ACTIVE/INACTIVE`; código inmutable, zona IANA | Organización, RBAC por alcance, auditoría | Fase 2.2 4/4 histórico; panel demo 16/16 histórico | Reglas persistidas, CORS HTTP real, activación autorizada |
| Autenticación | `auth/*`, `sessions/*`, `UserCredential`, `AuthSession` | `/auth/login`, `/refresh`, `/logout`, `/me` | Sesión opaca, expiración, rotación y revocación preparadas | Prisma, Argon2id, auditoría de seguridad | Evidencia histórica Fase 1.4; no repetida en 2.6-A | Migración sin aplicar, login persistido, HTTP autorizado |
| Autorización RBAC | `authorization/*`, `Role`, `Permission`, `UserRole` | Guards y metadatos `RequirePermissions` | Alcance `ORGANIZATION` y `BRANCH`, denegación por defecto | Autenticación, Prisma, sucursal activa | Fase 2.3: guard real con fixture, 17/17 histórico | Matriz definitiva, siembra, HTTP y revocación persistida |
| Empleados | `employees/*`, `Employee` | `employees.read/manage`; rutas `/employees` | `ACTIVE/INACTIVE`; crear, listar, actualizar y cambiar estado | Organización, auditoría, RBAC | Fase 2.3 17/17 histórico; demo React 16/16 histórico | PostgreSQL, vínculo `Employee–AppUser`, HTTP integral |
| Asignaciones de sucursal | `EmployeesService`, `EmployeeBranchAssignment` | `employees.read/manage`; rutas de empleado bajo sucursal | `ACTIVE/INACTIVE/CANCELED`; asignar, desactivar, cancelar | Empleado y sucursal activos, FKs compuestas, auditoría | Fase 2.3 y demo 2.5 históricos | Carrera de estado, PostgreSQL y RBAC sembrado |
| Turnos | `EmployeesService`, `WorkShift` | `work-shifts.read/manage`; `/work-shifts` | `SCHEDULED/CANCELED`; crear, editar, cancelar | Sucursal activa, instantes ISO, auditoría | Fase 2.3 histórica; panel 2.5 16/16 histórico | Solapamientos, PostgreSQL, zona IANA real en API |
| Asignaciones de turno | `EmployeesService`, `WorkShiftAssignment` | `work-shifts.read/manage`; rutas `/assignments` | `ACTIVE/INACTIVE/CANCELED`; asignar y cambiar estado | Turno programado, empleado y asignación laboral activos | Fase 2.3 histórica; demo 2.5 histórica | Carrera cancelación/asignación y aislamiento PostgreSQL |
| Áreas | `floor/*`, `Area` | `areas.read/manage`; `/areas` y `/areas/:id/status` | `ACTIVE/INACTIVE`; código por sucursal; desactivación protegida | Sucursal activa, auditoría | Fase 2.4: 9/9 histórico; demo 2.5 histórico | Migración y restricciones reales |
| Mesas | `floor/*`, `DiningTable` | `tables.read/manage`; `/tables` y `/tables/:id/status` | `AVAILABLE`, `OCCUPIED`, `CLEANING`, `RESERVED`, `BLOCKED`, `OUT_OF_SERVICE` | Área activa, capacidad, máquina de estados, auditoría | Fase 2.4 9/9 histórico; demo 2.5 histórico | HTTP, concurrencia y FK real |
| Sesiones estructurales | `FloorService`, `TableSession` | `table-sessions.read/manage`; rutas `/sessions` | `OPEN/CLOSED`, versión, historial; apertura/cierre estructural | Mesa, transacción, índice parcial, auditoría | Fase 2.4 9/9 histórico; demo 2.5 histórico | Índice parcial aplicado, aislamiento, reintentos e idempotencia |
| Auditoría técnica | `AuditEvent`, `SecurityAuditEvent`, servicios de dominio | Eventos transaccionales de cada mutación | Conservación de evento técnico; rollback simulado | Prisma y transacciones | Fases 2.2–2.4 usan fixtures en memoria | Persistencia, retención, exportación y restauración |
| API NestJS | `apps/api/src/main.ts`, módulos por dominio | REST versionado `/api/v1`, DTO, filtros y guards | Validación, errores controlados y CORS restringido | NestJS, Prisma, autorización | Builds y suites focalizadas históricas | HTTP integral, CORS loopback autorizado, TLS/LAN |
| Prisma/PostgreSQL | `schema.prisma`, migraciones de fases 1.2–2.4 | Esquema y migraciones preparados | UUID, FKs, restricciones, índices y auditoría modelados | PostgreSQL como autoridad transaccional | Inspección estática; migraciones 2.3/2.4 sin aplicar | Base temporal autorizada, migraciones y restore |
| Panel administrativo | `apps/admin_web/src/App.tsx`, paneles React | Permisos demo; rutas ADM mínimas | Formularios demo, ACK, 401/403/409, navegación | Tokens, `AdminRepository` | `test:phase-2.5` 16/16 y build históricos | Autenticación real, accesibilidad/HTTP/visual física |
| Repositorios admin | `data.ts`: `AdminRepository`, `DemoRepository`, `RestRepository` | Lecturas REST preparadas; escrituras REST bloqueadas | Datos ficticios en memoria; errores tipados | Contratos de API y panel | `test:phase-2.5` 16/16 histórico | Adaptador autenticado, contratos HTTP reales, snapshots persistidos |

## Casos de validación

| ID | Módulo o flujo | Regla | Componentes | Precondición | Escenario | Resultado esperado | Tipo | Procedimiento reproducible | Evidencia actual | Riesgo | Estado / bloqueo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V26-ORG-01 | Organizaciones | No cruzar organizaciones | AuthorizationService, servicios | Dos organizaciones fixture | Solicitar recurso ajeno | Denegación controlada | Seguridad y aislamiento | Referencia: `test:phase-2.3` | 17/17 histórico; no ejecutado 2.6-A | ALTO | VALIDADA |
| V26-ORG-02 | Sucursales | Sucursal inactiva no opera ordinariamente | AuthorizationService, Branch | Grant y sucursal inactiva | Solicitud con `branchId` | 403, sin mutación | Seguridad | `test:phase-2.3` | 17/17 histórico | ALTO | VALIDADA |
| V26-ORG-03 | Sucursales | Recurso sólo en su sucursal | Guards, servicios | Dos sucursales fixture | Usar `branchId` ajeno | 403/404 controlado | Seguridad y aislamiento | `test:phase-2.3` y `2.4` | Histórico en fixture | ALTO | VALIDADA |
| V26-ORG-04 | Sucursales | Reactivación requiere alcance organizacional | OrganizationsController | Branch inactiva | PATCH administrativo | Sólo grant ORGANIZATION permitido | Integración en memoria | `test:phase-2.2` | 4/4 histórico | MEDIO | VALIDADA |
| V26-ORG-05 | Sucursales | Zona IANA válida y datos DTO estrictos | DTO, ValidationPipe | Entrada HTTP simulada | UUID, `null`, espacios, zona inválida | 400 controlado | Integración HTTP simulada | `test:phase-2.2` | 4/4 histórico | MEDIO | VALIDADA |
| V26-ORG-06 | Auditoría | Escritura y evento son una unidad | Services, AuditEvent | Fixture transaccional | Fallar auditoría simulada | Sin cambio parcial | Integración en memoria | Suites fases 2.2–2.4 | Evidencia histórica por fase | ALTO | VALIDADA |
| V26-EMP-01 | Empleados | Código único por organización | EmployeesService, Employee | Organización fixture | Crear código repetido | 409 y sin duplicado | Integración en memoria | `test:phase-2.3` | 17/17 histórico | MEDIO | VALIDADA |
| V26-EMP-02 | Empleados | Inactivo no recibe asignaciones | EmployeesService | Empleado `INACTIVE` | Asignar sucursal o turno | Rechazo controlado | Integración en memoria | `test:phase-2.3` | 17/17 histórico | ALTO | VALIDADA |
| V26-EMP-03 | Asignación laboral | Sólo empleado/sucursal activos y misma organización | EmployeesService | Entidades activas | Asignar empleado válido | Relación ACTIVE auditada | Integración en memoria | `test:phase-2.3` | 17/17 histórico | MEDIO | VALIDADA |
| V26-EMP-04 | Asignación laboral | Rechazar ajena, duplicada o inactiva | Service, FKs | Fixture cruzado | Repetir o cruzar asignación | 404/409 sin fila adicional | Integración en memoria | `test:phase-2.3` | 17/17 histórico | ALTO | VALIDADA |
| V26-EMP-05 | Turnos | Instantes incluyen `Z` u offset | DTO, WorkShift | Payload | Enviar ISO sin offset | 400, sin horario ambiguo persistido | Unitarias | `test:phase-2.3` | 17/17 histórico | MEDIO | VALIDADA |
| V26-EMP-06 | Turnos | Presentar en zona IANA de sucursal | WorkShiftsPanel, Branch | Sucursal zona distinta | Crear/editar turno | ISO Z correcto, no zona navegador | Componentes React | `test:phase-2.5` | 16/16 histórico | MEDIO | VALIDADA |
| V26-EMP-07 | Turnos | DST ambiguo/inexistente no se ajusta | WorkShiftsPanel, `Intl` | Zona con DST | Capturar hora inválida/ambigua | Error explícito, sin envío | Componentes React | `test:phase-2.5` | 16/16 histórico | MEDIO | VALIDADA |
| V26-EMP-08 | Turnos | Cancelación bloquea asignación nueva | EmployeesService | Turno cancelado | Asignar empleado | Rechazo controlado | Integración en memoria | `test:phase-2.3` | 17/17 histórico | ALTO | VALIDADA |
| V26-EMP-09 | Turnos | No solapar jornadas sin política aprobada | WorkShift, servicio | Regla empresarial pendiente | Dos turnos superpuestos | No afirmar prohibición actual | PostgreSQL real | Definir política y prueba | Sin regla aprobada | MEDIO | BLOQUEADA_POR_AUTORIZACION |
| V26-FLR-01 | Áreas | Código único por sucursal | FloorService, Area | Área existente | Crear código duplicado | 409 controlado | Integración en memoria | `test:phase-2.4` | 9/9 histórico | MEDIO | VALIDADA |
| V26-FLR-02 | Mesas | Capacidad es entero positivo | DTO, DiningTable | Payload | 0, negativo, decimal o >1000 | 400 controlado | Integración en memoria | `test:phase-2.4` | 9/9 histórico | MEDIO | VALIDADA |
| V26-FLR-03 | Mesas | Traslado sólo dentro de sucursal y área activa | FloorService | Dos áreas, dos sucursales | Actualizar `areaId` | Aceptar local; rechazar ajena/inactiva | Integración en memoria | `test:phase-2.4` | 9/9 histórico | ALTO | VALIDADA |
| V26-FLR-04 | Áreas | No desactivar área con mesas | FloorService | Área con mesa | Cambiar a INACTIVE | 409, área conserva estado | Integración en memoria | `test:phase-2.4` | 9/9 histórico | MEDIO | VALIDADA |
| V26-FLR-05 | Mesas | Transiciones administrativas permitidas | FloorService | Estado observado | Transición permitida | Nuevo estado y auditoría | Integración en memoria | `test:phase-2.4` | 9/9 histórico | MEDIO | VALIDADA |
| V26-FLR-06 | Mesas | Rechazar transición prohibida y `OCCUPIED` manual | DTO, FloorService | Mesa no ocupada | Solicitar estado inválido | 400/409 sin sobrescritura | Integración en memoria | `test:phase-2.4` | 9/9 histórico | ALTO | VALIDADA |
| V26-FLR-07 | Mesas | Estado de origen no se sobrescribe en carrera | FloorService | Fixture de cambio intermedio | Actualizar tras lectura | 409 y sin auditoría de operación fallida | Concurrencia simulada | `test:phase-2.4` | 9/9 histórico, determinista | ALTO | VALIDADA |
| V26-SES-01 | Sesiones | Sólo `AVAILABLE` abre sesión | FloorService, TableSession | Mesa disponible | Abrir sesión | OPEN y mesa OCCUPIED tras ACK | Integración en memoria | `test:phase-2.4` y `2.5` | Histórica | ALTO | VALIDADA |
| V26-SES-02 | Sesiones | Una OPEN por mesa | Índice parcial, service | Sesión OPEN fixture | Segunda apertura | 409 y una sola OPEN | Integración en memoria | `test:phase-2.4` | Fase 2.6-B: `test:phase-2.6`, 15/15 en memoria; índice no aplicado | CRÍTICO | PENDIENTE: falta índice parcial PostgreSQL |
| V26-SES-03 | Sesiones | No abrir desde CLEANING/RESERVED/BLOCKED/OOS | FloorService | Mesa no disponible | Abrir | 409, sin sesión | Integración en memoria | `test:phase-2.4` | 9/9 histórico | ALTO | VALIDADA |
| V26-SES-04 | Sesiones | Cierre exige versión vigente | FloorService, TableSession | OPEN versión N | Cerrar con N | CLOSED, `closedAt`, versión N+1 | Integración en memoria | `test:phase-2.4` | 9/9 histórico | ALTO | VALIDADA |
| V26-SES-05 | Sesiones | Versión antigua no cierra | Service | OPEN versión N | Cerrar con N-1 | 409, mantiene OPEN | Concurrencia simulada | `test:phase-2.4` | 9/9 histórico | ALTO | VALIDADA |
| V26-SES-06 | Sesiones | Secuencia AVAILABLE→OCCUPIED→CLEANING | Service, DiningTable | Mesa disponible | Abrir y cerrar | Estados exactos y sin cierre comercial | Integración en memoria | `test:phase-2.4` y `2.5` | Histórica | ALTO | VALIDADA |
| V26-SES-07 | Sesiones | Cierre conserva historial | TableSession | Sesión cerrada | Consultar lista | Fila CLOSED visible | Integración en memoria | `test:phase-2.4` y `2.5` | Histórica | MEDIO | VALIDADA |
| V26-SES-08 | Sesiones | Falla de auditoría o precondición revierte | Service, AuditEvent | Falla simulada | Abrir/cerrar | Sin mutaciones parciales | Integración en memoria | `test:phase-2.4` | 9/9 histórico | CRÍTICO | VALIDADA |
| V26-SES-09 | Sesiones | Integridad ante carreras reales | Prisma, PostgreSQL | Base temporal autorizada | Aperturas/cierres concurrentes | Única OPEN y conflictos serializados | PostgreSQL real | Base temporal, migración y aislamiento | No ejecutada | CRÍTICO | BLOQUEADA_POR_AUTORIZACION |
| V26-AUT-01 | Autenticación | Identidad o credencial inválida se rechaza | AuthService, PasswordService | Fixture autorizado | Login inválido | Error seguro, sin token | Unitarias / HTTP simulada | Suites Fase 1.4 | Histórica; no repetida | ALTO | VALIDADA |
| V26-AUT-02 | Autenticación | Sesión válida se autentica | AuthGuard, SessionService | Sesión fixture | Solicitud protegida | Identidad válida en request | Unitarias | Suites Fase 1.4 | Histórica; no persistida 2.6-A | ALTO | VALIDADA |
| V26-AUT-03 | Autenticación | Sesión expirada se rechaza | AuthGuard, SessionService | Token expirado | Solicitud protegida | 401 controlado | Unitarias / HTTP simulada | Suites Fase 1.4; demo 2.5 | Histórica | ALTO | VALIDADA |
| V26-AUT-04 | RBAC | Permiso faltante devuelve 403 | AuthorizationGuard | Identidad sin permiso | Endpoint protegido | 403, sin servicio | Seguridad y aislamiento | `test:phase-2.3` | 17/17 histórico | ALTO | VALIDADA |
| V26-AUT-05 | RBAC | Grant ORGANIZATION sólo sirve su organización | AuthorizationService | Grant organización | Recurso local y ajeno | Autoriza local; deniega ajeno | Seguridad y aislamiento | `test:phase-2.3` | 17/17 histórico | ALTO | VALIDADA |
| V26-AUT-06 | RBAC | Grant BRANCH no sale de sucursal | AuthorizationService | Grant sucursal | Recurso de otra sucursal | 403 | Seguridad y aislamiento | `test:phase-2.3` | 17/17 histórico | ALTO | VALIDADA |
| V26-AUT-07 | RBAC | Revocación persistida expulsa acceso | Auth/Authorization + PostgreSQL | Rol/permiso persistido | Revocar y repetir solicitud | Denegación tras revalidación | PostgreSQL real | Matriz RBAC, datos y base temporal | No ejecutada | CRÍTICO | BLOQUEADA_POR_AUTORIZACION |
| V26-AUT-08 | API | Datos ajenos no llegan a Prisma sin control | Guards, ParseUUIDPipe | Request cruzada/malformada | Llamar endpoint | 400/403/404 seguro | Integración HTTP simulada | Plan 2.6-C | No ejecutada | ALTO | PENDIENTE |
| V26-ADM-01 | Panel | Navegación ADM usa rutas aprobadas | App, wireframes | Navegador jsdom | Ir a todos los destinos | Ruta y vista coherentes | Componentes React | `test:phase-2.5` | 16/16 histórico | BAJO | VALIDADA |
| V26-ADM-02 | Panel | Selector aísla sucursal demo | App, repositorios | Dos sucursales demo | Cambiar selector | Sin mezclar registros | Componentes React | `test:phase-2.6` | Fase 2.6-D/E: cambio de selector y descarte de respuesta antigua | MEDIO | VALIDADA en demo React |
| V26-ADM-03 | Panel | Formularios sólo confirman tras ACK | Paneles, DemoRepository | Repositorio ONLINE | Crear/editar entidad | Éxito posterior a respuesta | Componentes React | `test:phase-2.5` | 16/16 histórico | MEDIO | VALIDADA |
| V26-ADM-04 | Panel | Permisos demo separan leer y administrar | Paneles, Permission | Set de permisos limitado | Renderizar acciones | Lectura sin acciones de escritura | Componentes React | `test:phase-2.5` | 16/16 histórico | MEDIO | VALIDADA |
| V26-ADM-05 | Panel | 401 muestra sesión expirada | App, AdminUxFeedback | Escenario SESSION_EXPIRED | Navegar o mutar | Pantalla de acceso, sin confirmación | Componentes React | `test:phase-2.5` | 16/16 histórico | MEDIO | VALIDADA |
| V26-ADM-06 | Panel | 403 muestra permiso insuficiente | App, paneles | Escenario FORBIDDEN | Consultar recurso | Oculta selector/acciones | Componentes React | `test:phase-2.5` | 16/16 histórico | MEDIO | VALIDADA |
| V26-ADM-07 | Panel | 409 conserva formulario | App, DemoRepository | MUTATION_REJECTED | Guardar formulario | Error y valores intactos | Componentes React | `test:phase-2.5` | 16/16 histórico | MEDIO | VALIDADA |
| V26-ADM-08 | Panel | Error/offline exige recuperación explícita | AdminUxFeedback | OFFLINE/READ_ERROR | Recuperar snapshot | Sin reintento automático de mutación | Componentes React | `test:phase-2.5` | 16/16 histórico | MEDIO | VALIDADA |
| V26-ADM-09 | Panel | Etiqueta DEMOSTRACIÓN y módulos pendientes no engañan | App | Renderizar menú | Abrir Pedidos/Menú/Cajas/Reportes | Aviso no implementado, sin operación | Componentes React | `test:phase-2.5` | 16/16 histórico | BAJO | VALIDADA |
| V26-ADM-10 | Repositorio REST | Escrituras no abren red ni se ejecutan | RestRepository | Adaptador por defecto | Invocar escritura | Error tipado 0 | Unitarias | `test:phase-2.5` | 16/16 histórico | ALTO | VALIDADA |
| V26-ADM-11 | Repositorio REST | Lecturas representan contratos existentes | RestRepository, HttpTransport | Transporte simulado | Listar dominios administrativos | Rutas GET y alcance correctos | Integración HTTP simulada | `test:phase-2.5` | 16/16 histórico | MEDIO | VALIDADA |

## Evidencia ejecutada — Fase 2.6-B

Fecha: 2026-11-02. Se ejecutó únicamente una suite de `DemoRepository` y
utilidades de zona horaria. No hubo PostgreSQL, migraciones, servidor HTTP,
red, Actions ni datos persistidos.

| Prueba | Casos de matriz relacionados | Resultado y evidencia | Limitación |
| --- | --- | --- | --- |
| `apps/admin_web/test/phase-2.6/domain-repository.test.ts` | `V26-ORG-02`, `V26-ORG-03`, `V26-AUT-03`, `V26-AUT-04`, `V26-ADM-08` | El modo demo aislado rechazó sucursal ajena, bloqueó la operación de dominio en una sucursal inactiva y reprodujo errores tipados 401, 403 y 0 sin mutar empleados. | Los 401/403 son simulaciones del adaptador demo; no validan AuthGuard, AuthorizationGuard ni RBAC persistidos. |
| misma suite | `V26-EMP-01` a `V26-EMP-08`, excepto `V26-EMP-09` | Creación y duplicado de empleados, asignación laboral, estado inactivo, instantes ISO, zona IANA/DST, cancelación y asignaciones de turno se comprobaron en memoria. | No establece política de solapamientos; `V26-EMP-09` sigue bloqueada por autorización. |
| misma suite | `V26-FLR-01` a `V26-FLR-06` | Duplicados, desactivación protegida, capacidad, traslado local, transición administrativa y rechazo de `OCCUPIED` manual se comprobaron contra el repositorio demo. | No verifica auditoría, servicio NestJS, FKs ni concurrencia PostgreSQL. |
| misma suite | `V26-SES-01` a `V26-SES-08` | Apertura, única OPEN en memoria, estado no disponible, cierre versionado, conflictos, secuencia de mesa e historial se comprobaron sin mutaciones parciales ante los conflictos reproducibles. | No prueba índice parcial, auditoría transaccional ni carreras reales de PostgreSQL; `V26-SES-02` y `V26-SES-09` conservan sus límites persistidos. |

Comando ejecutado: `pnpm --filter @restaurant-os/admin-web test:phase-2.6`.
Resultado: **15 pruebas correctas, 0 fallidas**. El primer intento dentro del
sandbox no llegó a ejecutar ninguna prueba por `EPERM` al renombrar la caché
temporal de Vite; la ejecución aislada autorizada fuera del sandbox completó la
suite sin iniciar servicios.

## Evidencia ejecutada — Fase 2.6-C

Fecha: 2026-11-02. Se ejecutaron instancias aisladas de guards, servicios,
controladores, DTOs y filtro HTTP con dependencias simuladas. No se abrió un
listener NestJS, no hubo transporte HTTP real, PostgreSQL, migraciones,
credenciales reales ni datos persistidos.

| Prueba | Casos de matriz relacionados | Resultado y evidencia | Limitación |
| --- | --- | --- | --- |
| `apps/api/test/unit/phase-2.6-c.test.mjs` | `V26-AUT-01`, `V26-AUT-02`, `V26-AUT-03` | `AuthGuard` real rechazó token ausente, inválido y sesión revocada simulada (401); sólo adjuntó una identidad válida. `AuthService` no emitió token ni registró la contraseña ante credenciales incorrectas. | No valida hash Argon2, sesión o revocación contra PostgreSQL persistido. |
| misma suite | `V26-AUT-04`, `V26-AUT-05`, `V26-AUT-06`, `V26-ORG-01`, `V26-ORG-02` | `AuthorizationGuard` y `AuthorizationService` reales aplicaron permisos, scope ORGANIZATION/BRANCH, otra organización, sucursal inactiva y ausencia de identidad mediante mocks Prisma. | Los grants son simulados; no existe matriz RBAC definitiva ni siembra persistida. |
| misma suite | `V26-AUT-07` | Simulación de rol inactivo y permiso con estado `INACTIVE` produjo 403. | La revocación persistida y la revalidación en base temporal siguen **BLOQUEADA_POR_AUTORIZACION**. |
| misma suite | `V26-ORG-05`, `V26-EMP-05`, `V26-FLR-02` | `ValidationPipe` real rechazó UUID/DTO inválidos, `null`, campos inmutables, instantes sin offset, capacidades no enteras y estado administrativo `OCCUPIED`. | No cubre una solicitud HTTP real ni validación PostgreSQL. |
| misma suite | `V26-AUT-08` | Controladores de organizaciones, empleados, turnos y mesas delegaron UUID, alcance, actor y DTOs esperados; el filtro HTTP normalizó 400, 401, 403, 404 y 409 sin devolver detalles sensibles. | Cobertura parcial: no sustituye una prueba HTTP integral autenticada ni demuestra que un recurso ajeno no llegue a Prisma. |

Comando ejecutado: `pnpm --filter @restaurant-os/api test:phase-2.6-c`.
Resultado: **9 pruebas correctas, 0 fallidas**. El script ejecutó
`pnpm db:generate` y `nest build`, sin conexión a una base de datos. También
se ejecutó `pnpm --filter @restaurant-os/api typecheck` correctamente.

## Evidencia ejecutada — Fase 2.6-D

Fecha: 2026-11-02. Se ejecutaron recorridos de componentes con React Testing
Library, Vitest y `DemoRepository` en memoria. No se inició backend, no hubo
PostgreSQL, migraciones, tráfico HTTP real, Actions ni datos persistidos.

| Prueba | Casos de matriz relacionados | Resultado y evidencia | Limitación |
| --- | --- | --- | --- |
| `apps/admin_web/test/phase-2.6/admin-panel.integration.test.tsx` | `V26-ADM-01`, `V26-ADM-02`, `V26-ADM-09` | Navegación horizontal, rutas administrativas mínimas, etiqueta DEMOSTRACIÓN, destinos pendientes, selector de sucursal y limpieza del detalle de mesa al cambiarla. También se comprobó foco inicial alcanzable por teclado. | jsdom no sustituye una revisión física con tecnología asistiva o navegador real. |
| misma suite | `V26-ADM-03`, `V26-ADM-05` a `V26-ADM-08` | Formularios no anuncian éxito hasta el ACK; 409 y rechazo de mutación preservan valores. Se verificaron banners de error de lectura, sin conexión y recuperación, 401 y 403 demo. | Son estados simulados del repositorio demo, no autenticación ni recuperación HTTP persistida. |
| misma suite | `V26-EMP-01`, `V26-EMP-04`, `V26-EMP-06` a `V26-EMP-08` | Creación de empleado con ACK demorado, asignación, confirmación de baja, zona IANA de sucursal distinta, rechazo DST y bloqueo de asignación en turno cancelado. | No cubre política de solapamientos, guardado ni concurrencia PostgreSQL. |
| misma suite | `V26-FLR-01` a `V26-FLR-06` | Creación y edición de área, capacidad nativa positiva, creación de mesa, omisión de `OCCUPIED` de controles administrativos y transición confirmada. | No demuestra FKs, auditoría o máquina de estados del servicio NestJS contra PostgreSQL. |
| misma suite | `V26-SES-01` a `V26-SES-08` | Conflicto de segunda apertura visible como 409 sin éxito falso; cierre con versión, transición a `CLEANING` e historial de sesión cerrada. | No prueba índice parcial, auditoría transaccional, bloqueo ni serialización reales. |

Comando ejecutado: `pnpm --filter @restaurant-os/admin-web test:phase-2.6`.
Resultado: **23 pruebas correctas, 0 fallidas**: 15 de Fase 2.6-B y 8 de
Fase 2.6-D. El primer intento dentro del sandbox no llegó a ejecutar pruebas
por `EPERM` al renombrar la caché temporal de Vite; la ejecución aislada
autorizada completó ambas suites sin iniciar servicios. La revisión visual
manual del propietario en `http://127.0.0.1:5173` se conserva como evidencia
separada de estas pruebas automatizadas.

## Evidencia ejecutada — Fase 2.6-E

Fecha: 2026-11-03. Se añadieron simulaciones deterministas de conflicto y
recuperación en `DemoRepository` y `TableSessionsPanel`. Las promesas
controladas verifican el orden de ACK y el descarte de lecturas obsoletas. No
hubo PostgreSQL, migraciones, NestJS, tráfico HTTP real, Actions ni datos
persistidos.

| Prueba | Casos de matriz relacionados | Resultado y evidencia | Limitación |
| --- | --- | --- | --- |
| `apps/admin_web/test/phase-2.6/concurrency-recovery.test.tsx` | `V26-SES-02`, `V26-SES-04` a `V26-SES-08` | Dos llamadas secuenciadas de apertura dejan una sola sesión `OPEN`; dos cierres con la misma versión sólo permiten uno. La sesión cerrada queda en historial con versión 2 y la mesa termina en `CLEANING`. | `Promise.allSettled` comprueba la secuencia determinista del repositorio en memoria; no representa carreras, bloqueos ni aislamiento PostgreSQL. `V26-SES-02` y `V26-SES-09` mantienen sus límites persistidos. |
| misma suite | `V26-EMP-04`, `V26-EMP-08`, `V26-FLR-05` | Una asignación laboral inactiva bloquea la asignación al turno y un cambio administrativo no modifica una mesa con sesión `OPEN`. Los estados previos permanecen visibles. | No sustituye las FKs, auditoría transaccional ni la concurrencia real del servicio. |
| misma suite | `V26-ADM-02` | Una lectura retrasada de Centro no sobrescribe la sesión de una mesa de Terraza después de cambiar el alcance. Se corrigió el panel para invalidar la generación de lectura anterior. | Valida el estado React en jsdom; no cubre cancelación de solicitudes HTTP reales ni sincronización offline. |
| misma suite | `V26-ADM-03`, `V26-ADM-07` | El cierre pendiente deshabilita la confirmación, no anuncia éxito antes del ACK y conserva sesión/mesa si la respuesta controlada es 409. | No hay reintentos automáticos, idempotencia ni transporte productivo en el modo demo. |

Comando ejecutado: `pnpm --filter @restaurant-os/admin-web test:phase-2.6`.
Resultado: **28 pruebas correctas, 0 fallidas**: 15 de Fase 2.6-B, 8 de Fase
2.6-D y 5 de Fase 2.6-E. La ejecución fue autorizada fuera del sandbox por la
caché temporal de Vite y no inició servicios.

## Evidencia consolidada — Fase 2.6-F

Fecha: 2026-11-03. Se reejecutaron una vez las validaciones focalizadas finales
para preparar revisión formal. No hubo PostgreSQL, migraciones, NestJS real,
HTTP autenticado, Actions, LAN/WSS, datos persistidos ni pruebas físicas.

| Comando | Resultado | Cobertura y limitación |
| --- | --- | --- |
| `pnpm --filter @restaurant-os/admin-web test:phase-2.6` | **28 correctas, 0 fallidas**; 3 archivos de prueba; 9.17 s. | 28 casos Admin únicos acumulados de B/D/E; repositorio demo y jsdom, no persistencia ni concurrencia SQL. |
| `pnpm --filter @restaurant-os/admin-web build` | Correcto; TypeScript/Vite y 1,587 módulos; 1.89 s. | Compilación estática, no HTTP real. |
| `pnpm --filter @restaurant-os/api test:phase-2.6-c` | **9 correctas, 0 fallidas**; 883 ms de pruebas. | Generó Prisma y compiló API; mocks de guards/controladores, sin listener ni PostgreSQL. |
| `pnpm --filter @restaurant-os/api typecheck` | Correcto. | Generó Prisma y validó TypeScript; no conexiones de base de datos. |
| `git diff --check` | Correcto. | No valida comportamiento ni persistencia. |

La distribución de estados de la matriz no cambia por esta consolidación:
`V26-SES-09` permanece `BLOQUEADA_POR_AUTORIZACION` y los casos que dependen
de PostgreSQL, RBAC persistido o HTTP integral conservan sus limitaciones.

## Resumen de la matriz

La matriz contiene **50 casos**: 45 `VALIDADA` con evidencia histórica o
focalizada, 2 `PENDIENTE` y 3 `BLOQUEADA_POR_AUTORIZACION`. Las Fases 2.6-B,
2.6-C, 2.6-D y 2.6-E añadieron evidencia aislada de dominio, seguridad,
contratos, interacción React y recuperación determinista; 2.6-F consolidó la
ejecución final. Nada de ello cambia la falta de evidencia persistida o HTTP
integral. Los casos bloqueados requieren expresamente una base PostgreSQL
temporal, migraciones o una matriz RBAC aprobada; no deben deducirse como
fallos funcionales.
