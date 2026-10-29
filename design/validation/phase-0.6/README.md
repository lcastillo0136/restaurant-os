# Evidencia visual de Fase 0.6

- `react-catalog.png`: captura real de Microsoft Edge Chromium, 1600 × 1200.
- `react-catalog-full.png`: captura real del catálogo completo, 1600 × 5000.

Las capturas fueron obtenidas desde el build Vite servido en
`http://127.0.0.1:4198/` por `scripts/serve-phase-0.6-catalog.mjs`. No son
imágenes generadas artificialmente.

No hay captura Flutter ni APK: Gradle falló antes de compilar al no poder
establecer una conexión de loopback en este entorno. El catálogo Android y sus
pruebas de widgets sí están incluidos; no se añadió Flutter Web para sustituir
la validación física pendiente.
