# Fase 2.6-A — Plan de ejecución de pruebas

Este plan deriva de la matriz de validación y no autoriza su implementación.
Cada bloque requerirá autorización específica antes de iniciar servicios, usar
PostgreSQL, crear datos temporales o acceder a red.

## 2.6-B — Dominio y repositorios

**Ejecución registrada (2026-11-02):** se creó y ejecutó
`apps/admin_web/test/phase-2.6/domain-repository.test.ts` mediante
`pnpm --filter @restaurant-os/admin-web test:phase-2.6`. Resultado: 15/15
correctas, sin servidor ni base de datos. La evidencia y los IDs cubiertos se
registran en `FASE-2.6-MATRIZ-VALIDACION.md`. Esta ejecución no cubre índices,
transacciones o concurrencia PostgreSQL y no inicia los bloques 2.6-C a 2.6-F.

- **Pruebas propuestas:** fixtures de organizaciones, empleados, turnos, áreas,
  mesas y sesiones; duplicados, estados, aislamiento, ACK y errores tipados.
- **Archivos esperados:** pruebas focalizadas bajo `apps/api/test/unit/` y
  `apps/admin_web/test/phase-2.6/`; las pruebas de Fase 2.5 sólo cambian si
  cambia su contrato.
- **Comandos:** suites focalizadas `test:phase-2.3`, `test:phase-2.4` y
  `test:phase-2.5`, priorizando el archivo afectado.
- **Criterios de aprobación:** datos ajenos/duplicados rechazados y ninguna
  mutación parcial en fixture; separar memoria de persistencia real.
- **Dependencias:** contratos y estados existentes.
- **Operaciones prohibidas:** migraciones, PostgreSQL, API real, Actions y datos
  reales.
- **Evidencia necesaria:** salida real, diff de tests y matriz actualizada.

## 2.6-C — API, seguridad y contratos

**Ejecución registrada (2026-11-02):** se creó y ejecutó
`apps/api/test/unit/phase-2.6-c.test.mjs` con
`pnpm --filter @restaurant-os/api test:phase-2.6-c`. Resultado: 9/9
correctas; el script generó el cliente Prisma y compiló NestJS, pero no abrió
un listener ni conectó PostgreSQL. También se ejecutó
`pnpm --filter @restaurant-os/api typecheck` correctamente. La evidencia e
IDs se registran en `FASE-2.6-MATRIZ-VALIDACION.md`. Siguen fuera de alcance
la prueba HTTP integral, RBAC sembrado y cualquier persistencia real.

- **Pruebas propuestas:** DTO/UUID, filtros, AuthGuard, AuthorizationGuard,
  permisos, alcance organización/sucursal y lecturas REST simuladas.
- **Archivos esperados:** tests de guards/controladores y contratos HTTP
  simulados; no endpoints nuevos sin ADR.
- **Comandos:** pruebas focalizadas API y build sólo si cambia TypeScript o un
  contrato ejecutable.
- **Criterios de aprobación:** 400/401/403/404/409 controlados, sin fuga entre
  organizaciones y escritura REST aún bloqueada.
- **Dependencias:** fixtures seguros; HTTP real exige autorización separada.
- **Operaciones prohibidas:** credenciales reales, login real, PostgreSQL, LAN y
  Actions.
- **Evidencia necesaria:** rutas contrastadas con controladores y resultados
  ejecutados, no sólo archivos presentes.

## 2.6-D — Componentes React

**Ejecución registrada (2026-11-02):** se creó y ejecutó
`apps/admin_web/test/phase-2.6/admin-panel.integration.test.tsx` mediante
`pnpm --filter @restaurant-os/admin-web test:phase-2.6`. Resultado: 23/23
correctas en la suite combinada (15 de 2.6-B y 8 recorridos React de 2.6-D),
sin backend ni base de datos. La evidencia cubre navegación, selección de
sucursal, formularios con ACK y conflicto, recuperación de estados UX,
permisos demo, zona IANA/DST, áreas, mesas y sesiones estructurales. La
revisión visual manual del propietario en `http://127.0.0.1:5173` es distinta
de la evidencia automatizada. Siguen pendientes la accesibilidad física,
HTTP integral y persistencia PostgreSQL.

- **Pruebas propuestas:** selector de sucursal, formularios, carga, ACK,
  errores, permisos demo, sesión expirada, rutas ADM, zona IANA/DST y
  accesibilidad focalizada de labels, foco y mensajes.
- **Archivos esperados:** `apps/admin_web/test/phase-2.5/*.test.tsx` y cambios
  de componente sólo ante defecto demostrado.
- **Comandos:** `pnpm --filter @restaurant-os/admin-web test:phase-2.5` y build
  Admin si cambia fuente.
- **Criterios de aprobación:** no confirmar antes del ACK, no reintentar
  mutaciones y no imitar operaciones comerciales no implementadas.
- **Dependencias:** jsdom/RTL; revisión visual física requiere autorización.
- **Operaciones prohibidas:** backend real, escritura REST, red y mockups
  privados.
- **Evidencia necesaria:** interacción ejecutada y, sólo si se autoriza,
  capturas locales distinguidas de prueba física.

## 2.6-E — Concurrencia y recuperación

**Ejecución registrada (2026-11-03):** se creó y ejecutó
`apps/admin_web/test/phase-2.6/concurrency-recovery.test.tsx` mediante
`pnpm --filter @restaurant-os/admin-web test:phase-2.6`. Resultado: 28/28
correctas en la suite combinada (15 de 2.6-B, 8 de 2.6-D y 5 de 2.6-E). La
evidencia nueva cubre conflictos deterministas de apertura/cierre, versión,
precondiciones de asignación y mesa, ACK pendiente/rechazado y descarte de una
lectura React fuera de orden. No ejecutó PostgreSQL ni demuestra bloqueos,
serialización o aislamiento real; esos ensayos conservan autorización separada.

- **Pruebas propuestas:** carreras de apertura/cierre, cambio de mesa,
  cancelación/asignación de turno, rollback, aislamiento, serialización e
  idempotencia persistida.
- **Archivos esperados:** integración PostgreSQL nueva y scripts revisables; no
  cambiar migraciones aprobadas sin necesidad.
- **Comandos:** sólo tras autorización contra una base temporal aislada, nunca
  `restaurant_dev`.
- **Criterios de aprobación:** única OPEN, sin cambios parciales y conflictos o
  reintentos documentados.
- **Dependencias:** autorización de creación, migración, datos, backup y posible
  eliminación de la base temporal; política de idempotencia.
- **Operaciones prohibidas:** PostgreSQL existente, migraciones no autorizadas y
  eliminación de recursos sin instrucción expresa.
- **Evidencia necesaria:** versión de migraciones, logs sin secretos, resultados
  de concurrencia y estado final inspeccionable.

## 2.6-F — Evidencia y cierre

**Ejecución registrada (2026-11-03):** se consolidaron las pruebas focalizadas
finales: Admin 28/28, API 9/9, build Admin y typecheck API correctos, además de
`git diff --check`. Se creó el informe integral, el manifiesto y el paquete de
revisión. La fase queda implementada y preparada para revisión, sin aprobación,
merge ni declaración de producción.

- **Pruebas propuestas:** consolidar resultados, auditar paquete, revisar
  secretos, pendientes y formato documental.
- **Archivos esperados:** evidencia, matriz/riesgos actualizados y paquete sólo
  si cambia contenido incluido.
- **Comandos:** `git diff --check` y únicamente pruebas focalizadas afectadas.
- **Criterios de aprobación:** cada caso registra comando, fecha, entorno,
  resultado y limitación; no declarar producción sin DB/red/físico real.
- **Dependencias:** resultados reales de 2.6-B a 2.6-E y revisión propietaria.
- **Operaciones prohibidas:** merge, etiquetas de aprobación, Actions o
  publicación sin autorización de cierre separada.
- **Evidencia necesaria:** informe de revisión, árbol limpio y pendientes
  conservados.
