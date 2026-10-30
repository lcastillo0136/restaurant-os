# Restaurant OS — Paquete de revisión Fase 0.7.1

Este paquete contiene exclusivamente la remediación técnica y su evidencia redistribuible para revisar la Fase 0.7.1.

## Revisión recomendada

1. Leer `docs/design/REMEDIACION-FASE-0.7.1.md`.
2. Revisar el addendum en `docs/design/VALIDACION-FASE-0.7.md` y el estado/pedientes actuales.
3. Inspeccionar los cambios de componentes, pruebas, estilos y dependencias incluidos.
4. Ejecutar desde la raíz extraída, con las dependencias del monorepo instaladas:

   ```text
   pnpm install --frozen-lockfile
   pnpm validate:phase-0.7.1:review
   ```

5. Consultar `design/validation/phase-0.7.1/react-catalog-remediated.png`, captura real del catálogo React servido por HTTP local.

## Exclusiones deliberadas

- Los cuatro PNG de `design/reference/` no se incluyen porque son referencias internas sin autorización comprobable de redistribución. El modo normal del validador exige y comprueba localmente sus SHA-256; `--review-package` exige que no estén en el paquete público.
- El APK debug, builds, dependencias instaladas, cachés y temporales no se incluyen.
- No se incluye ninguna licencia open source para Restaurant OS; esa decisión continúa pendiente del propietario.

La falta de una prueba física Android nueva se registra como `NO EVALUADO`, no como evidencia de defecto ni como una prueba superada.
