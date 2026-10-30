# Evidencia Fase 0.7.1

Fecha: 2026-10-30

## Evidencia visual

- `react-catalog-remediated.png`: captura real de Microsoft Edge Chromium headless contra el catálogo React servido por HTTP local.
- Dimensiones: 1600 × 5000 px.
- Tamaño: 316587 bytes.
- SHA-256: `6F6FB82D7FA2BA899A152BEF09C01906AEEB6C875E731B07DC1F16FFAE5466F4`.
- La captura fue inspeccionada visualmente: formularios, estados warning/error, KDS oscuro, tarjetas y controles se renderizan sin regresiones visibles.

No se generaron imágenes artificiales. No se produjo captura Android nueva porque `flutter devices --machine` no detectó un dispositivo Android durante esta ejecución.

## Evidencia Android de compilación

El APK es un build ignorado por Git y no se incluye en el paquete público:

- Ruta local: `packages/flutter_design_system/example/build/app/outputs/flutter-apk/app-debug.apk`.
- Tamaño: 165403862 bytes.
- SHA-256: `A0E8543CE8EA71F4C7296089A12ECE48CED80E6BB04D22594BF7559440A4B41F`.

La compilación no equivale a instalación, navegación ni validación física.
