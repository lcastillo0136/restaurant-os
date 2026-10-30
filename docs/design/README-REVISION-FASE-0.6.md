# Restaurant OS — paquete de revisión Fase 0.6

Este paquete contiene el sistema de componentes React/Flutter, los adaptadores
generados, los siete tokens canónicos, documentación y evidencia visual. No
incluye dependencias instaladas, builds, cachés, perfiles, secretos ni las cuatro
referencias privadas cuya redistribución sigue pendiente.

## Revisión rápida

1. Consulte `docs/design/COMPONENTES-FASE-0.6.md`.
2. Abra `design/validation/phase-0.6/react-catalog-full.png` para inspeccionar
   el catálogo React completo capturado desde el build real.
3. Revise `packages/web_ui/catalog/` y
   `packages/flutter_design_system/example/` para los catálogos fuente.
4. Ejecute la validación estructural del paquete:

```powershell
node scripts/validate-phase-0.6.mjs --review-package
```

## Ejecutar el catálogo React desde fuente

Requiere Node.js y pnpm. Desde la raíz extraída:

```powershell
pnpm install --frozen-lockfile
pnpm --filter @restaurant-os/web-ui build
node scripts/serve-phase-0.6-catalog.mjs
```

Abra `http://127.0.0.1:4198/`. La instalación crea dependencias localmente,
pero estas no están incluidas en el ZIP.

## Ejecutar el catálogo Flutter

Requiere Flutter con destino Android:

```powershell
cd packages/flutter_design_system
flutter analyze
flutter test
cd example
flutter run -d <android-device>
```

No se creó Flutter Web. El catálogo Android fue compilado, instalado y validado
en un dispositivo físico. En sandboxes restringidos, Flutter necesita acceso de
escritura a su caché; el build correcto se ejecutó con autorización puntual
fuera del sandbox.

## Integridad y alcance

El SHA-256 se entrega junto al ZIP en un archivo `.sha256` externo. La fase está
aprobada por el propietario. No contiene lógica de negocio ni inicia la Fase 0.7.
