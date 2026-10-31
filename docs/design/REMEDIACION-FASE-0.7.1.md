# Fase 0.7.1 — Remediación de hallazgos NO-GO

Fecha: 2026-10-30

Rama: `feature/phase-0.7-design-validation`

Dictamen: **GO técnico para aprobar la remediación de Fase 0.7**, sujeto a revisión del propietario. Este dictamen no cierra la Fase 0, no autoriza Fase 1 y no declara preparación para producción.

## Alcance preservado

Se conservaron los 46 identificadores/pantallas, las 47 capturas aprobadas, los cuatro PNG oficiales, los siete JSON canónicos y los contratos públicos de los componentes. No se añadió lógica de negocio, autenticación, pagos, CFDI, NFC/QR ni integración externa. Los ajustes de contraste son locales a componentes y muestras; los tokens oficiales no cambiaron.

## Vulnerabilidades: antes y después

| Identificador | Paquete inicial | Ruta y alcance | Versión corregida | Estado final |
|---|---|---|---|---|
| [GHSA-q7qp-rjg7-q26m](https://github.com/advisories/GHSA-q7qp-rjg7-q26m) / CVE-2026-113872 | `multer 2.4.0`, alta | Transitiva de producción por `@nestjs/platform-express 11.2.8`; DoS de proceso mediante `fileFilter` asíncrono y petición abortada | `2.5.0` | Resuelta mediante sustitución exacta en pnpm; auditoría de producción limpia |
| [GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3) / CVE-2026-104848 | `tinypool 1.1.1`, crítica | Transitiva de desarrollo por Vitest; RCE en trabajadores de pruebas/CI si existe prototype pollution | `>=2.1.1` | Ruta vulnerable eliminada al actualizar Vitest |
| [GHSA-85c8-ppgw-ccpr](https://github.com/advisories/GHSA-85c8-ppgw-ccpr) / CVE-2026-104849 | `tinypool 1.1.1`, crítica | Transitiva de desarrollo por Vitest; redirección de worker mediante opciones contaminadas | `>=2.1.2` | Ruta vulnerable eliminada al actualizar Vitest |
| [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) / CVE-2026-84373 | `vitest 3.2.7`, moderada | Directa de desarrollo; lectura arbitraria desde plugin de mocks si se expone el servidor | `4.1.11` | Resuelta con `vitest 4.1.12` |
| GHSA-82fw-gwwq-j7x9 / CVE-2026-84373 | `@vitest/mocker 3.2.7`, moderada | Transitiva de desarrollo por Vitest | `4.1.11` | Resuelta con `@vitest/mocker 4.1.12` |
| [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) / CVE-2026-112949 | `@vitest/mocker 3.2.7`, moderada | Transitiva de desarrollo; inyección de código al exponer el plugin de mocks | `4.1.12` | Resuelta con `@vitest/mocker 4.1.12` |
| [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) / CVE-2026-93753 | `deepmerge 4.3.1`, baja | Transitiva de desarrollo: Nest CLI → fork-ts-checker; prototype poisoning en tooling | Sin versión publicada | Residual no bloqueante: solo tooling, severidad baja, sin parche; mantener seguimiento |

### Implementación controlada

- `packages/web_ui/package.json`: Vitest `^4.1.12`.
- `pnpm-workspace.yaml`: sustituciones dirigidas únicamente de `multer@2.4.0 → 2.5.0` y `webpack@5.106.2 → 5.112.2`.
- `pnpm-lock.yaml`: regenerado sin `--force`; instalación con `--frozen-lockfile` reproducida correctamente.
- No se actualizó NestJS a una versión mayor. Las sustituciones compensan pines exactos del proveedor y se validaron con pruebas/builds.

Resultado posterior:

- `pnpm audit --prod --json`: 0 vulnerabilidades.
- `pnpm audit --json`: 0 críticas, 0 altas, 0 moderadas y 1 baja sin parche.
- `pnpm peers check`: sin incidencias; webpack 5.112.2 satisface `schema-utils 4.8.1`.

## Accesibilidad Flutter

`ProductCard` y `CartSummary` usan `LayoutBuilder` y el escalado efectivo de texto para pasar a composición vertical cuando el ancho es menor a 420 dp o el escalado supera 150 %. Los textos dejan de truncarse en el modo adaptativo y las acciones se expanden al ancho disponible. `RestaurantButton` permite wrap centrado cuando está expandido.

Pruebas añadidas:

- `ProductCard`: 320 × 800 dp, texto 200 %, sin overflow y botón ≥48 dp.
- `CartSummary`: 320 × 640 dp, texto 200 %, sin overflow y botón ≥48 dp.
- Regresión conjunta a 600 × 900 dp.

Resultado: 10/10 pruebas Flutter superadas; `flutter analyze` sin incidencias.

## Accesibilidad React

El modal ahora:

- abre mediante `showModal()` y hace inerte el contenido subyacente en navegadores compatibles;
- enfoca el primer control disponible;
- contiene `Tab` y `Shift+Tab`;
- procesa `Escape` y el evento `cancel` sin confirmar implícitamente;
- bloquea cierre durante estado pendiente;
- restaura el foco al elemento invocador al cerrar o desmontarse;
- expone `aria-labelledby`, `aria-describedby` y `aria-modal`.

Se añadieron pruebas de foco inicial, ciclo de teclado, restauración, Escape y estado pendiente. Resultado: 12/12 pruebas React superadas.

## Contraste WCAG 2.2 AA

Se añadieron colores derivados locales mediante `color-mix()`; no se modificó ningún JSON canónico.

| Tema | Warning/texto | Danger/texto | Borde de control | Texto sobre danger | Foco |
|---|---:|---:|---:|---:|---:|
| admin-light | 5.61:1 | 7.56:1 | 6.14:1 | 4.80:1 | 4.99:1 |
| customer-warm | 5.21:1 | 6.95:1 | 5.28:1 | 4.82:1 | 5.01:1 |
| kitchen-dark | 8.94:1 | 6.12:1 | 7.67:1 | 5.68:1 | 7.72:1 |
| pos-light | 5.61:1 | 7.56:1 | 6.14:1 | 4.80:1 | 6.75:1 |

Los textos normales superan 4.5:1; bordes y foco superan 3:1. Error y danger se representan además con texto/semántica, no solo color.

## Licencias y publicación

`pnpm install --frozen-lockfile` fue correcto. `pnpm licenses list --json` terminó correctamente desde esa instalación y produjo 554 entradas únicas:

| Licencia | Paquetes |
|---|---:|
| MIT | 477 |
| ISC | 24 |
| Apache-2.0 | 21 |
| BSD-2-Clause | 11 |
| BSD-3-Clause | 8 |
| BlueOak-1.0.0 | 5 |
| Unlicense | 2 |
| 0BSD, CC-BY-4.0, CC0-1.0, MIT-0, MPL-2.0, Python-2.0 | 1 cada una |

No quedaron entradas sin licencia declarada en el inventario de pnpm. La licencia de Restaurant OS continúa pendiente y no se seleccionó automáticamente. Las referencias privadas no se añadieron al historial ni al ZIP; sus hashes sí se validaron.

## Android

- `flutter devices --machine`: solo Windows, Chrome y Edge; Android físico **NO EVALUADO**.
- Paquete Flutter: analyze correcto y 10/10 pruebas.
- Ejemplo Android: analyze correcto.
- `table_kiosk`: analyze correcto y 1/1 prueba.
- APK debug del catálogo compilado correctamente con directorios temporales confinados al workspace.
- APK: 165403862 bytes; SHA-256 `A0E8543CE8EA71F4C7296089A12ECE48CED80E6BB04D22594BF7559440A4B41F`.

La falta de dispositivo es una limitación de evidencia, no un defecto comprobado, y la compilación no se presenta como prueba física.

## Regresiones ejecutadas

- React web-ui: typecheck, lint, 12/12 pruebas y build correctos.
- Admin/KDS/POS: tres builds correctos, 1579 módulos cada uno.
- NestJS: typecheck y build correctos.
- Flutter: package/example/table_kiosk analyze correctos; 10/10 + 1/1 pruebas.
- Validadores scaffold/Fase 0.3/Fase 0.4/Fase 0.5/Fase 0.6/Fase 0.7/Fase 0.7.1: correctos. El validador histórico 0.7 conserva su diagnóstico original; 0.7.1 prueba la remediación local.
- HTTP Fase 0.5: 15 recursos `200` y una ruta ausente `404`.
- Auditoría pública: correcta, sin rutas prohibidas ni patrones fuertes de secretos.
- Cuatro referencias oficiales: SHA-256 intactos.

## Evidencia visual

- `design/validation/phase-0.7.1/react-catalog-remediated.png`: captura real 1600 × 5000, inspeccionada visualmente.
- No se creó captura Android porque no existía dispositivo compatible.

## Dictamen

Todos los bloqueos obligatorios del NO-GO fueron corregidos y verificados. La única vulnerabilidad residual es baja, de tooling, sin parche publicado y fuera del grafo de producción. Por ello el dictamen de la remediación es **GO técnico pendiente de aprobación del propietario**.

Este GO no cierra automáticamente la Fase 0, no inicia Fase 1 y no equivale a preparación para producción. La prueba física Android sigue pendiente como evidencia de hardware.

## Aprobación formal — 2026-10-30

El propietario aprobó la remediación técnica 0.7.1 y el cierre técnico de Fase 0. La integración se completó mediante el Pull Request #2 y merge commit `024975e0311140df79c0be201ac2c590ce6c7155`; la etiqueta `design-v0.7.1-approved` apunta a esa línea base. Fase 1 permanece sin iniciar. El modo normal de `scripts/validate-phase-0.7.1.mjs` conserva la comprobación de los cuatro hashes privados y `--review-package` valida el contenido redistribuible sin requerirlos, rechazando además cualquier PNG privado incluido por error.
