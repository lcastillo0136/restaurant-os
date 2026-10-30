# Propuesta de integración continua posterior a Fase 0.7

Estado: propuesta documental; no se creó ni activó ningún workflow en esta fase.

## Objetivo

Validar cada Pull Request hacia `Master` sin exponer secretos ni las cuatro referencias visuales privadas. El workflow deberá usar permisos mínimos (`contents: read`), instalación reproducible y cancelación de ejecuciones obsoletas por rama.

## Disparadores y política

- `pull_request` hacia `Master` y `push` a `Master` después de integrar.
- Concurrencia por PR con cancelación de la ejecución anterior.
- Ningún despliegue, publicación de paquetes o acceso a entornos productivos.
- No usar secretos en jobs de validación de código/diseño.
- Requerir Pull Request y checks verdes; no reescribir historial ni auto-fusionar.

## Jobs propuestos

### 1. Integridad pública de diseño

Runner Linux, Node y pnpm fijados por `packageManager`, con `pnpm install --frozen-lockfile`.

Ejecutar:

1. `node scripts/audit-public-baseline.mjs`
2. `node scripts/validate-scaffold.mjs --review-package`
3. `node scripts/validate-phase-0.3.mjs --review-package`
4. `node scripts/validate-phase-0.4-delivery-2.mjs --review-package`
5. `node scripts/validate-phase-0.5.mjs --review-package`
6. `node scripts/test-phase-0.5-navigation.mjs`
7. `node scripts/validate-phase-0.6.mjs --review-package`
8. Una variante pública de `validate-phase-0.7.mjs` que valide el manifiesto de hashes sin exigir los PNG privados.

Los validadores actuales que requieren `design/reference/` deben recibir explícitamente modo público antes de usarse en GitHub. No se deben subir las imágenes como artefacto ni sustituirlas por copias.

### 2. React

- Typecheck, lint, Vitest y build de `@restaurant-os/web-ui`.
- Builds de `admin-web`, `kitchen-web` y `pos-web`.
- Pruebas automáticas de accesibilidad con axe como complemento, nunca sustituto de teclado/lector de pantalla.
- Pruebas específicas del modal: focus trap, `Escape`, restauración de foco y reduced motion.

### 3. NestJS

- Typecheck y build de `@restaurant-os/api`.
- Pruebas unitarias/integración/negativas cuando existan módulos funcionales.
- Fallar si `pnpm audit --prod` reporta severidad alta o crítica.

### 4. Flutter

Runner Linux con Flutter 3.47.7 fijado:

- `flutter pub get`, `flutter analyze` y `flutter test` en paquete, ejemplo y `table_kiosk`.
- Pruebas de widget a 320 dp, texto 200 %, orientación vertical/horizontal, 48 dp y semántica.
- Build APK debug del catálogo como job separado; no instalar en hardware desde CI público.
- Mantener telemetría deshabilitada y no crear Flutter Web como sustituto de Android.

### 5. Seguridad, licencias y cadena de suministro

- `pnpm audit --prod --audit-level high` como gate.
- Auditoría completa como reporte, con excepción temporal solo mediante ADR con vencimiento.
- Lista de licencias/SBOM desde instalación limpia; revisión explícita de paquetes sin licencia declarada.
- Escaneo de secretos del conjunto preparado antes de subir artefactos.
- Artefactos permitidos: reportes de pruebas y builds sin secretos; nunca referencias privadas, perfiles, bases, `.env`, ZIP históricos o dependencias instaladas.

## Matriz de checks obligatorios propuesta

| Check | Gate inicial |
|---|---|
| `design-integrity-public` | Obligatorio tras adaptar validadores a repositorio público |
| `react-typecheck-lint-test-build` | Obligatorio |
| `nestjs-typecheck-build` | Obligatorio |
| `flutter-analyze-test` | Obligatorio |
| `flutter-apk-debug` | Obligatorio cuando el build sea estable en runner limpio |
| `security-production` | Obligatorio, cero altas/críticas |
| `licenses-and-attributions` | Obligatorio antes de una distribución pública |

## Condiciones previas a activación

1. Corregir la vulnerabilidad alta de `multer` y las críticas de tooling.
2. Hacer que los validadores distingan evidencia local privada de la comprobación pública por manifiesto.
3. Resolver el peer mismatch de webpack.
4. Aprobar el tratamiento de licencias y atribuciones.
5. Crear el workflow en una rama separada y revisarlo por Pull Request; esta propuesta no autoriza su publicación automática.
