# Validación final visual — Fase 0.1

Fecha: 29-10-2026.

## Referencias oficiales

Los SHA-256 de las cuatro imágenes en `design/reference/` coinciden exactamente con los valores originales entregados por el propietario. La lista de hashes y dimensiones está en `REFERENCIAS-VISUALES.md`.

## Muestras estáticas y evidencia

| Entorno | Implementación | Evidencia |
| --- | --- | --- |
| Administración | React/Vite, tema `admin-light`, navbar superior, tarjetas, filtros y estados | `design/validation/phase-0.1/01-admin-react.png` |
| Tableta de cliente | Flutter Android, tema `customer-warm`, tarjetas táctiles, tipografía, estados y botones de muestra | Sin captura: no hay dispositivo Android conectado; no se añadió web como sustituto; Gradle no puede crear conexión loopback para empaquetar Android. |
| Cocina KDS | React/Vite, tema `kitchen-dark`, barra operativa y columnas de estados de muestra | `design/validation/phase-0.1/03-kds-react.png` |
| Caja POS | React/Vite, tema `pos-light`, rail lateral y resumen persistente de muestra | `design/validation/phase-0.1/04-pos-react.png` |

Las tres PNG disponibles son capturas reales de builds Vite locales con Chromium headless; no son imágenes generadas. Todas las pantallas son estáticas: no consultan API, no gestionan órdenes, no procesan pagos y sus botones no ejecutan procesos de negocio.

## Validaciones ejecutadas

- Comparación SHA-256 de los cuatro PNG con los valores originales: correcta.
- `pnpm --filter @restaurant-os/admin-web build`: correcto.
- `pnpm --filter @restaurant-os/kitchen-web build`: correcto.
- `pnpm --filter @restaurant-os/pos-web build`: correcto.
- `flutter --no-version-check analyze`: correcto.
- `flutter --no-version-check test`: correcto, 1 prueba superada tras corregir un desbordamiento de etiqueta.
- `pnpm validate:scaffold`: correcto; referencias, tokens, paridad React/Flutter, muestras estáticas y evidencia comprobadas.

## Riesgos y límites

- Los valores específicos de tokens continúan sujetos a aprobación visual sobre dispositivos representativos.
- `flutter build web` no procede porque el proyecto se creó solo para Android. No se cambió esa decisión para obtener una captura.
- El empaquetado Android continúa bloqueado por `Unable to establish loopback connection` de Gradle/JDK antes de compilar; no se generó APK.
- `pnpm peers check` informa un peer transitorio de Nest CLI: `schema-utils@4.8.1` solicita `webpack ^5.112.0` y Nest CLI instala `webpack 5.106.2`. Los builds React y NestJS pasan; no se altera la herramienta transitoria fuera del alcance de esta fase.

## Estado

La evidencia técnica de Fase 0.1 está lista para revisión visual. No iniciar Fase 0.2 hasta una instrucción expresa del propietario.
