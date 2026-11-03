# Fase 2.6-A — Brechas y riesgos

Fecha: 2026-11-03. Base revisada:
`b69437c67820a786aeca0d2654813075699967c2`.

## Criterio de clasificación

Los hallazgos se derivan de inspección estática y evidencia histórica documentada.
Ninguno se declara defecto confirmado sin una reproducción o una evidencia de
ejecución. La severidad expresa impacto potencial si se intentara operar el
sistema fuera del alcance actual, no autorización para hacerlo.

| ID | Nivel | Clasificación | Hallazgo | Evidencia | Tratamiento requerido |
| --- | --- | --- | --- | --- | --- |
| R26-01 | CRÍTICO | Dependencia de autorización | Migraciones de autenticación, empleados y mesas sin validar en una base temporal. | Fases 1.4, 2.3 y 2.4; esquema y migraciones presentes. | Autorizar PostgreSQL temporal aislado; no usar `restaurant_dev`. |
| R26-02 | CRÍTICO | Cobertura parcial | Unicidad OPEN, bloqueos y serialización se simulan deterministamente en memoria, sin índice ni aislamiento SQL. | Fase 2.4; Fase 2.6-B/E: 28/28 en `DemoRepository`, incluidas aperturas/cierres en conflicto. | Ensayos PostgreSQL con aislamiento y reintentos autorizados. |
| R26-03 | CRÍTICO | Dependencia de autorización | Matriz RBAC definitiva no aprobada ni sembrada. | Pendientes Fases 2.1–2.5; Fase 2.6-C validó guards con grants simulados, incluidos rol inactivo y permiso revocado. | Aprobar política, roles, permisos e identidades persistidas. |
| R26-04 | ALTO | Cobertura ausente | Falta HTTP integral autenticado para guards, DTO y respuestas administrativas. | Pruebas actuales en memoria/simuladas. | Ejecutar 2.6-C sólo con entorno autorizado. |
| R26-05 | ALTO | Riesgo potencial | Carrera entre inactivación/cancelación y asignaciones laborales o de turno. | Fase 2.6-E rechaza deterministamente asignación de turno tras inactivar la asignación laboral; no hay carrera concurrente real. | Casos concurrentes PostgreSQL y aislamiento observado. |
| R26-06 | ALTO | Riesgo potencial | `RestRepository` prepara lecturas y bloquea escrituras; no autentica ni usa transporte productivo. | `data.ts`, Fase 2.5. | Mantener demo; validar contrato, auth y HTTP antes de habilitarlo. |
| R26-07 | ALTO | Fuera de alcance | Pedidos, menú comercial, caja y reportes no están implementados. | `App.tsx`, Fase 2.5. | No presentarlos como operaciones reales. |
| R26-08 | ALTO | Dependencia de autorización | Sin evidencia actual de TLS/WSS, LAN, dispositivos o prueba sin WAN. | Pendientes Fases 1.4, 1.5 y 2.5. | Requiere infraestructura y autorización específica. |
| R26-09 | MEDIO | Riesgo potencial | Turnos UI usan `Intl` a precisión de minuto y rechazan DST ambiguo/inexistente. | WorkShiftsPanel, Fase 2.5. | Decidir UX de desambiguación si negocio necesita programarlas. |
| R26-10 | MEDIO | Cobertura parcial | Sin validación física reciente de accesibilidad o visual del panel. | El propietario confirmó revisión visual; Fase 2.6-D verificó roles, labels, alertas, confirmaciones y foco de teclado en jsdom. | Conservar pendiente una revisión asistida, de navegador y dispositivos reales. |
| R26-11 | MEDIO | Dependencia de autorización | Retención, exportación y respuesta a incidentes de auditoría no aprobadas. | `docs/10-PENDIENTES.md`. | Definir política antes de eventos persistidos. |
| R26-12 | BAJO | Riesgo potencial | Referencias visuales privadas no se redistribuyen. | Referencias visuales y `.gitignore`. | Mantener exclusión y autorización de derechos. |
| R26-13 | BAJO | Cobertura ausente | El sandbox puede fallar con `EPERM` al renombrar caché temporal de Vite. | Reproducido antes de ejecutar 2.6-B; la ejecución aislada autorizada posterior completó 15/15. | Registrar condición; no es fallo funcional. |

## Hallazgos confirmados

**Uno, corregido.** La Fase 2.6-E reprodujo que una lectura demorada de una
sucursal podía sobrescribir en React el snapshot ya cargado de otra sucursal o
mesa. `TableSessionsPanel` ahora invalida la generación de lectura anterior y
la prueba conserva el escenario. Las Fases 2.6-B, 2.6-C, 2.6-D y 2.6-E suman
28 pruebas de panel/repositorio y 9 de API sin otro defecto reproducido. El
`EPERM` de la caché temporal de Vite queda clasificado como limitación del
sandbox, no como defecto funcional. La consolidación 2.6-F reejecutó las suites
focalizadas y los builds sin detectar una regresión.

## Priorización posterior

1. Resolver las autorizaciones de PostgreSQL temporal y RBAC definitiva.
2. Ejecutar contratos HTTP y seguridad sólo con entorno autorizado.
3. Validar concurrencia persistida e idempotencia antes de habilitar escritura
   REST.
4. Mantener pedidos, pagos, caja, LAN y dispositivos fuera de ejecución hasta
   contar con fases y autorizaciones específicas.
