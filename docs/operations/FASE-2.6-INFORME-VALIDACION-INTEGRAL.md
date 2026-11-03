# Fase 2.6 — Informe de validación integral

Fecha de cierre técnico: 2026-11-03

Estado: **IMPLEMENTADA Y PREPARADA PARA REVISIÓN**

Rama: `feature/phase-2.6-integral-validation`

Línea base aprobada: `b69437c67820a786aeca0d2654813075699967c2`

## 1. Resumen ejecutivo

La Fase 2.6 consolidó validaciones focalizadas de dominio, API y panel
administrativo en modo demostración. La evidencia automatizada final contiene
28 pruebas Admin únicas y 9 pruebas API únicas, todas correctas. Se corrigió
un defecto reproducible de React: una respuesta antigua podía sobrescribir el
snapshot vigente al cambiar sucursal o mesa.

La fase no está aprobada formalmente, no se integró en `Master` y no declara
preparación para producción.

## 2. Alcance de Fase 2.6

- Auditoría y matriz de 50 casos (2.6-A).
- Dominio y repositorios demo en memoria (2.6-B).
- Guards, DTO, controladores y filtro HTTP mediante dependencias simuladas
  (2.6-C).
- Interacción React, permisos demo, estados UX y navegación (2.6-D).
- Conflictos deterministas, control de versión y recuperación del snapshot
  (2.6-E).
- Consolidación de evidencias, paquete y revisión técnica (2.6-F).

No se implementaron módulos comerciales ni se modificaron migraciones,
esquema Prisma, diseño, tokens, Flutter, POS o KDS.

## 3. Línea base aprobada

La rama parte del merge de Fase 2.5 identificado por
`b69437c67820a786aeca0d2654813075699967c2`
(`admin-panel-v2.5-approved`). La revisión verificó que este commit es ancestro
de la rama de Fase 2.6.

## 4. Arquitectura validada

La evidencia ejercita el monolito NestJS mediante objetos simulados y el panel
React mediante `AdminRepository`/`DemoRepository`. El panel mantiene
`DemoRepository` en memoria; `RestRepository` conserva escrituras bloqueadas.
PostgreSQL sigue siendo la autoridad transaccional prevista, pero no se
inició ni se consultó en esta fase.

## 5. Módulos revisados

Organizaciones/sucursales, autorización por organización y sucursal,
empleados/asignaciones, turnos, áreas, mesas, sesiones estructurales, estados
UX, navegación administrativa, DTO y errores HTTP controlados.

## 6. Resultados de bloques A-F

| Bloque | Resultado |
| --- | --- |
| 2.6-A | Matriz documental de 50 casos, inventario y riesgos. |
| 2.6-B | 15 pruebas Admin de repositorio/demo correctas. |
| 2.6-C | 9 pruebas API correctas; build API incluido en el script. |
| 2.6-D | Cobertura React acumulada de 23 pruebas Admin. |
| 2.6-E | Cobertura Admin acumulada de 28 pruebas y corrección de snapshot obsoleto. |
| 2.6-F | Reejecución final focalizada, informe, manifiesto y paquete de revisión. |

Los resultados acumulados de Admin no se suman como ejecuciones independientes:
la ejecución final contiene 28 pruebas únicas.

## 7. Matriz de 50 casos

Distribución final: **45 `VALIDADA`**, **2 `PENDIENTE`** y **3
`BLOQUEADA_POR_AUTORIZACION`**. La matriz detallada, con requisito, riesgo,
tipo de prueba, evidencia y limitación por caso, está en
`FASE-2.6-MATRIZ-VALIDACION.md`.

Los casos que requieren PostgreSQL, RBAC persistido o HTTP integral no se
marcaron como validados con mocks.

## 8. Pruebas automatizadas ejecutadas

| Comando | Fecha | Resultado | Duración disponible | Limitación |
| --- | --- | --- | --- | --- |
| `pnpm --filter @restaurant-os/admin-web test:phase-2.6` | 2026-11-03 | 28 correctas, 0 fallidas | 9.17 s | jsdom y repositorio en memoria; sin red ni persistencia. |
| `pnpm --filter @restaurant-os/admin-web build` | 2026-11-03 | correcto; 1,587 módulos | 1.89 s | Build estático, no prueba HTTP real. |
| `pnpm --filter @restaurant-os/api test:phase-2.6-c` | 2026-11-03 | 9 correctas, 0 fallidas | 883 ms de pruebas | Genera Prisma y compila NestJS; no inicia listener ni conecta PostgreSQL. |
| `pnpm --filter @restaurant-os/api typecheck` | 2026-11-03 | correcto | no informado | Genera Prisma y valida TypeScript; sin conexión de base. |
| `git diff --check` | 2026-11-03 | correcto | no aplica | Sólo formato del diff. |

## 9. Defecto detectado y corregido

`TableSessionsPanel` permitía que una lectura retrasada de una sucursal o mesa
anterior sobrescribiera el snapshot ya cargado de otro alcance. Se añadió un
contador de generación que invalida la lectura saliente durante el cambio de
alcance y antes de actualizar estado.

## 10. Evidencia de regresión

`apps/admin_web/test/phase-2.6/concurrency-recovery.test.tsx` mantiene una
prueba con promesas controladas: se retrasa la lectura de Centro, se cambia a
una mesa de Terraza y luego se resuelve la lectura antigua. El panel conserva
la mesa de Terraza. La misma suite comprueba ACK pendiente, 409, versión y
estados finales de sesión.

## 11. Validación visual del propietario

El propietario revisó visualmente el panel administrativo en modo
demostración. Vite continúa limitado a `http://127.0.0.1:5173/`; esta revisión
visual se distingue de accesibilidad asistida, hardware y navegador físico.

## 12. Limitaciones de la validación

No hubo PostgreSQL temporal, migraciones, servidor NestJS real, HTTP
autenticado integral, LAN/WSS, GitHub Actions, dispositivos ni prueba sin WAN.
Las pruebas de conflictos en memoria son deterministas y no prueban aislamiento
ni bloqueo SQL.

## 13. Riesgos residuales

Persisten como prioritarios el índice parcial de una sesión OPEN, concurrencia
y serialización persistidas, RBAC sembrado, HTTP autenticado, idempotencia,
TLS/WSS, LAN, accesibilidad física, backups/restauración y hardware. El detalle
de clasificación está en `FASE-2.6-BRECHAS-Y-RIESGOS.md`.

## 14. Operaciones no ejecutadas

No se ejecutaron PostgreSQL, `restaurant_dev`, migraciones, bootstrap de
administrador, backend real, LAN/WSS, Actions, pruebas de Flutter/POS/KDS,
publicación comercial ni integración de ramas.

## 15. Criterios de aceptación

Se cumplieron los criterios autorizados de la Fase 2.6: pruebas focalizadas
reproducibles, build Admin/API y typecheck, matriz con límites explícitos,
regresión del defecto confirmado, revisión de formato, documentación y paquete
de revisión sin secretos ni referencias visuales privadas.

## 16. Recomendación técnica

**Recomendar aprobación para revisión formal del PR**, condicionada a conservar
los pendientes de persistencia, RBAC, HTTP y validación física. No recomendar
producción ni integrar en `Master` sin aprobación formal posterior.
