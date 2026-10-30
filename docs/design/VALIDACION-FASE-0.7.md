# Fase 0.7 — Validación integral del diseño

Fecha de ejecución: 2026-10-30

Rama: `feature/phase-0.7-design-validation`

Resultado: **validación completada; no-go condicionado para iniciar módulos funcionales**.

## Alcance y criterio

Esta fase auditó la línea visual y técnica aprobada de Fases 0.1 a 0.6. No se modificaron tokens, componentes, wireframes, mockups, prototipos ni referencias oficiales; tampoco se implementó lógica de negocio. La decisión de salida exige evidencia sobre integridad, recorridos, componentes, accesibilidad, seguridad de dependencias y reproducibilidad.

El resultado no equivale a certificación WCAG ni a preparación para producción. Los hallazgos P1 y P2 deben corregirse y volver a probarse en una rama posterior autorizada.

## Resultado ejecutivo

| Área | Resultado | Evidencia |
|---|---|---|
| Inventario visual | Pasa | 46 wireframes, 46 mockups canónicos, 47 capturas por la variante horizontal y 46 destinos de prototipo |
| Tokens y temas | Pasa | 7 JSON válidos, 4 temas, adaptadores React/Flutter coherentes y objetivo táctil 48 px/dp |
| Referencias oficiales | Pasa | 4/4 SHA-256 coinciden; siguen excluidas del Git público por licencia pendiente |
| Componentes React | Pasa con hallazgo | 21 componentes, 10 pruebas, typecheck, lint y build correctos; modal con defecto de foco |
| Componentes Flutter | Pasa con bloqueo | 16 componentes, 7 pruebas y análisis correctos; desbordes a 200 % de texto en 320 dp |
| Recorridos aprobados | Pasa a nivel prototipo | 5 recorridos y 46 destinos; ACK simulado explícito, sin red ni persistencia |
| Dependencias | No pasa | 1 vulnerabilidad alta de producción y vulnerabilidades críticas de tooling |
| Accesibilidad WCAG 2.2 AA | No pasa todavía | Contraste, reflow/escalado y gestión de foco requieren corrección y reevaluación |
| Android físico Fase 0.7 | No ejecutado | No había dispositivo Android disponible durante esta ejecución |

## Integridad y regresión

Se ejecutaron y superaron:

- `node scripts/validate-scaffold.mjs`: 29 rutas, 7 tokens y 4 temas.
- `node scripts/validate-phase-0.3.mjs`: 46 IDs y las cinco experiencias, estados y hashes.
- `node scripts/validate-phase-0.4-delivery-2.mjs`: 40 mockups nuevos + 6 aprobados, 47 capturas y recursos locales.
- `node scripts/test-phase-0.5-navigation.mjs`: 46 destinos, 11 estados y 5 recorridos.
- `node scripts/validate-phase-0.5.mjs`: integridad visual, ausencia de red/persistencia y 8 capturas.
- `node scripts/test-phase-0.5-http.mjs`: 15 recursos HTTP `200` y una ruta ausente `404`. El primer intento dentro del sandbox no pudo abrir loopback; el reintento autorizado fue correcto.
- `node scripts/validate-phase-0.6.mjs`: 7 tokens, 4 temas, 21 componentes React, 16 Flutter y referencias intactas.
- `node scripts/validate-phase-0.7.mjs`: inventarios cruzados, capturas, componentes, hashes y contraste canónico.

Los cinco recorridos aprobados mantienen su semántica de demostración: administración, cliente, cocina, caja y mesero. Los prototipos bloquean mutaciones sin conexión y no muestran pedidos, pagos, cierres o entregas confirmados sin un ACK simulado explícito. No se encontró red, persistencia local ni backend en los componentes o prototipos de diseño.

## React, NestJS y builds

Resultados reales:

- `pnpm --filter @restaurant-os/web-ui typecheck`: correcto.
- `pnpm --filter @restaurant-os/web-ui lint`: correcto.
- `pnpm --filter @restaurant-os/web-ui test`: 10/10 pruebas superadas.
- `pnpm --filter @restaurant-os/web-ui build`: correcto, 39 módulos.
- `pnpm --filter @restaurant-os/api typecheck` y `build`: correctos.
- Builds Vite de Administración, Cocina KDS y POS: correctos, 1579 módulos cada uno.
- `pnpm peers check`: no pasa; `schema-utils@4.8.1` solicita webpack `^5.112.0` y está instalado `5.106.2`. Los builds actuales pasan, pero la incompatibilidad debe resolverse antes de fijar CI.

Prueba manual real del catálogo React mediante navegador local:

- El árbol accesible expone botones, campos, selección, tabla, navegación, estados y controles deshabilitados con nombre/rol.
- El orden de tabulación inicial avanza por los selectores de tema y controles interactivos.
- El modal recibe foco al abrirse, pero después de recorrer `Cancelar` y `Confirmar` el foco escapa del diálogo.
- Al cerrarse, el foco vuelve al área web y no al botón `Abrir modal de confirmación`.

## Flutter y Android

Resultados reales:

- Paquete de diseño: `flutter analyze` correcto y `flutter test` 7/7.
- Ejemplo de catálogo: `flutter analyze` correcto.
- Aplicación `table_kiosk`: `flutter analyze` correcto y `flutter test` 1/1.
- `flutter pub outdated --no-dev-dependencies`: dependencias directas de producción al día; solo `material_color_utilities` transitiva tiene una versión posterior incompatible con la resolución actual.
- `flutter devices --machine`: solo Windows, Chrome y Edge; ningún Android disponible.
- Compilación APK del catálogo: el primer intento falló porque Java no pudo establecer loopback. El reintento con `TEMP`, `TMP`, `java.io.tmpdir` y preferencia IPv4 limitados al proceso terminó correctamente en 42.4 s, sin cambios globales.
- APK ignorado por Git: `packages/flutter_design_system/example/build/app/outputs/flutter-apk/app-debug.apk`, 150403702 bytes, SHA-256 `32A0A8D50048360FB666C5BF4FCD683BB5493C29180BB7EEAF842BB72D80DDEE`.

No se realizó en esta fase una instalación, navegación, orientación, lector de pantalla ni captura nueva en Android físico. La evidencia física de Fase 0.6 permanece válida históricamente, pero no sustituye una repetición para Fase 0.7.

Una prueba temporal de estrés —retirada al terminar— usó viewport de 320 × 640 dp y escalado de texto 200 %:

- `ProductCard`: desbordamiento horizontal de 104 px.
- `CartSummary`: desbordamiento horizontal de 60 px.
- `AttentionRequestCard`: pasa el mismo escenario.

## Accesibilidad y usabilidad

La revisión combina inspección de código, pruebas existentes, contraste calculado desde los tokens y navegación real por teclado. No se declara cumplimiento total de WCAG 2.2 AA.

### Hallazgos

| Severidad | Hallazgo | Impacto | Corrección propuesta |
|---|---|---|---|
| P1 | `ProductCard` y `CartSummary` desbordan con texto 200 % a 320 dp | Contenido/acción inaccesible en móviles estrechos o texto ampliado | Cambiar a composición vertical o breakpoint adaptable, permitir wrap y agregar pruebas 200 %/320 dp |
| P2 | Modal React no contiene ni restaura el foco | Usuario de teclado puede salir al contenido subyacente y perder contexto | Usar diálogo modal real con `showModal()`, focus trap, restauración al invocador y pruebas de teclado |
| P2 | `warning` sobre superficie clara da 3.64:1 en admin/customer/POS | Texto normal no alcanza 4.5:1 | Proponer token semántico `on-warning` o color textual más oscuro mediante ADR/aprobación visual |
| P2 | `danger` sobre superficie KDS da 4.47:1; blanco sobre `danger` da 3.15:1 | Texto/botón crítico puede fallar AA | Definir color `on-danger` por tema y probar usos reales |
| P2 | Borde/superficie da 1.31–1.58:1 | Campos o controles identificados solo por borde no alcanzan 3:1 no-texto | Añadir token de outline fuerte o una señal adicional no dependiente de color |
| P3 | No hubo Android físico ni lector de pantalla en Fase 0.7 | Falta evidencia de TalkBack, orientación y ergonomía real | Repetir matriz física antes de aprobar módulos funcionales móviles |

Contrastes que sí pasan incluyen texto primario, secundario y acento principal de los cuatro temas; el foco con acento frente a fondo también supera 3:1. El color `disabled` no se evalúa como texto activo, pero no debe usarse para contenido informativo.

## Seguridad y dependencias

`pnpm audit --audit-level low` encontró 7 vulnerabilidades:

- 2 críticas en `tinypool` por la ruta de desarrollo `web_ui > vitest > tinypool`.
- 1 alta en `multer@2.4.0`, dependencia de producción de `@nestjs/platform-express@11.2.8`; corregida upstream en `multer >= 2.5`.
- 3 moderadas en Vitest/@vitest/mocker.
- 1 baja en `deepmerge` usado por tooling de Nest CLI, sin parche publicado.

`pnpm audit --prod --audit-level low` confirma que la vulnerabilidad alta de `multer` afecta el grafo de producción. Es bloqueo P1 para declarar el backend listo, aunque todavía no exista lógica transaccional.

`pnpm licenses list --json` no pudo completarse por un índice faltante de pnpm para `@types/react`. Como respaldo se inspeccionaron 607 manifiestos únicos instalados: predominan MIT, ISC, Apache-2.0 y BSD; también aparecen MPL-2.0, CC-BY-4.0, CC0, Unlicense, MIT-0, Python-2.0 y dos paquetes sin licencia declarada (`busboy@1.6.0` y `streamsearch@1.1.0`). Antes de distribución debe regenerarse una lista reproducible desde una instalación limpia y revisar atribuciones. No se añadió ninguna dependencia en esta fase.

La auditoría pública sigue sin detectar secretos en los archivos versionados. Las cuatro referencias privadas continúan fuera del historial público, y el repositorio sigue sin licencia open source aprobada.

## Documentación y deuda detectada

`docs/design/MOCKUPS-FASE-0.4.md` y `docs/design/PROTOTIPOS-FASE-0.5.md` conservan metadatos históricos de “pendiente de aprobación” que fueron superados posteriormente por la aprobación del propietario y por `docs/STATUS.md`. No se reescribieron entregables históricos durante esta validación; debe decidirse si se añade una fe de erratas sin alterar su evidencia original.

## Decisión de salida

No se recomienda iniciar módulos funcionales todavía. Condiciones mínimas para un **go**:

1. Resolver y auditar de nuevo la vulnerabilidad alta de producción en `multer` y las críticas del tooling de pruebas.
2. Corregir y probar reflow/escalado 200 % de `ProductCard` y `CartSummary`.
3. Corregir la gestión de foco del modal React.
4. Aprobar mediante ADR los ajustes semánticos de contraste sin cambiar silenciosamente los tokens visuales.
5. Ejecutar validación física Android con orientación, TalkBack/teclado y recorridos críticos.
6. Ejecutar la propuesta de CI en un Pull Request y fijar checks obligatorios.

Hasta entonces la línea aprobada permanece íntegra, pero la preparación para desarrollo funcional es **NO-GO condicionado**.
