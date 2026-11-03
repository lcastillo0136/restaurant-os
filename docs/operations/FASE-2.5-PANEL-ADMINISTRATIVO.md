# Fase 2.5 — Panel administrativo funcional

Fecha de preparación para revisión: 2026-11-02.

## Alcance implementado

El panel administrativo React usa el tema `admin-light`, una navegación superior
horizontal y una etiqueta visible `DEMOSTRACIÓN`. La aplicación trabaja solamente
con datos ficticios en memoria: no inicia la API, no abre conexiones REST reales,
no usa PostgreSQL y no ejecuta migraciones.

`App.tsx` concentra el shell, la selección global de sucursal y los escenarios de
experiencia demo. Los paneles funcionales se mantienen separados para conservar
responsabilidades acotadas:

- `EmployeesPanel.tsx` y `EmployeeAssignmentsPanel.tsx`: empleados y sus
  asignaciones de sucursal.
- `WorkShiftsPanel.tsx`: alta, edición, cancelación y asignación elegible a
  turnos.
- `AreasPanel.tsx` y `TablesPanel.tsx`: áreas, mesas, capacidad, cambios de
  área y transiciones administrativas permitidas.
- `TableSessionsPanel.tsx`: consulta, apertura y cierre estructural de sesiones
  de mesa con versión e historial.
- `AdminUxFeedback.tsx`: conexión demo, recuperación explícita, acceso
  insuficiente y sesión expirada.

La navegación conserva los destinos documentados `/dashboard`, `/mesas`,
`/pedidos`, `/menu`, `/personal`, `/cajas`, `/reportes` y `/ajustes`. Pedidos,
Menú, Cajas y Reportes se presentan como no implementados y no ofrecen
operaciones simuladas como si fueran comerciales reales.

## Repositorios y permisos

`AdminRepository` define los contratos tipados para sucursales, empleados,
asignaciones, turnos, áreas, mesas y sesiones estructurales. `DemoRepository`
los implementa en memoria, aislando organización y sucursal, validando códigos,
estados y transiciones, y devolviendo errores tipados, incluidos conflictos 409.
Una mutación sólo actualiza la interfaz después de su resolución satisfactoria.

`RestRepository` conserva el mismo contrato para lecturas preparadas mediante
un transporte inyectado. Las escrituras permanecen bloqueadas explícitamente;
no contiene credenciales ni activa conexiones de red por defecto.

Las lecturas REST usan exclusivamente las rutas GET de controladores existentes
para sucursales, empleados, asignaciones por sucursal, turnos, asignaciones de
turno, áreas, mesas y sesiones. El contrato actual no consume el detalle de la
organización; para consultar asignaciones de un empleado recorre las sucursales
de la organización porque el backend expone esas asignaciones por sucursal.

Las acciones y paneles comprueban los permisos declarados por recurso
(`branches`, `employees`, `work-shifts`, `areas`, `tables` y
`table-sessions`). Esta es una representación demo de la política: no constituye
una matriz RBAC definitiva ni crea roles o permisos reales.

## Estados UX y sesiones

Los escenarios demo cubren disponible, sin conexión, error de lectura, rechazo
de mutación, permiso insuficiente y sesión expirada. La recuperación requiere
una acción explícita de actualización; no se reintentan mutaciones de forma
automática. Los mensajes usan texto, `role="status"` o `role="alert"`, y los
botones de envío se deshabilitan durante operaciones pendientes.

Las sesiones de mesa son exclusivamente estructurales: una mesa `AVAILABLE`
puede abrir una sesión `OPEN` y pasa a `OCCUPIED`; el cierre exige la versión
vigente, conserva historial, incrementa versión y lleva la mesa a `CLEANING`.
No existen pedidos, pagos, propinas, tickets ni cierres comerciales.

Los turnos se muestran y capturan en la zona IANA de la sucursal seleccionada,
no en la zona del navegador. La conversión obtiene un instante ISO con `Z` antes
de enviarlo al repositorio. Las horas inexistentes o ambiguas por cambios de
horario de verano se rechazan con un mensaje explícito; no se ajustan
silenciosamente. La implementación usa `Intl` disponible en el navegador y
trabaja con precisión de minuto, que es la del campo `datetime-local` actual.

## Pruebas y validación ejecutadas

Se añadieron `apps/admin_web/test/phase-2.5/data.test.ts`,
`apps/admin_web/test/phase-2.5/app.test.tsx` y
`apps/admin_web/test/phase-2.5/panels.test.tsx`, ejecutadas mediante:

```text
pnpm --filter @restaurant-os/admin-web test:phase-2.5
```

Resultado real: 3 archivos de prueba correctos y 16 pruebas correctas. La primera
ejecución dentro del sandbox no cargó las suites por un `EPERM` al renombrar la
caché temporal de Vite; el mismo comando, autorizado fuera de ese sandbox,
finalizó correctamente sin iniciar servicios ni red.

La cobertura focalizada verifica aislamiento, validación y conflictos de
sucursales; empleados y asignaciones; turnos y horarios en una zona de sucursal
distinta al equipo, incluidos cambios de horario; áreas, mesas y máquina de
estados; sesiones versionadas e historial; bloqueo de escrituras REST y las
rutas GET existentes de NestJS; y navegación, DEMOSTRACIÓN, rechazo 409,
recuperación, permiso insuficiente y sesión expirada en React. Las pruebas de
paneles ejercitan creación/edición de empleado, asignación, creación/cancelación
de turno, creación de área y mesa, y apertura/cierre estructural de sesión.

También se ejecutó:

```text
pnpm --filter @restaurant-os/admin-web build
```

Resultado real: TypeScript y Vite correctos; 1,587 módulos transformados y
artefactos generados sólo en `apps/admin_web/dist/` (no incluidos en el paquete
de revisión).

La revisión estática de ADM-01, ADM-02, ADM-03, ADM-04, ADM-07 y ADM-10 confirma
navegación superior, tema `admin-light`, jerarquía de paneles, formularios,
tablas y detalle de mesa coherentes con su alcance. No se generaron capturas ni
se realizó validación física; las PNG privadas no se modificaron ni se incluyen.

## Limitaciones pendientes

Esta entrega no está aprobada para producción ni conectada al backend. Permanecen
pendientes: autenticación real del panel, matriz RBAC y siembra controlada,
PostgreSQL temporal y migraciones, HTTP integral, concurrencia real,
idempotencia persistida, sesiones comerciales, TLS/WSS y LAN, dispositivos
físicos, backup/restore y prueba física sin WAN.
