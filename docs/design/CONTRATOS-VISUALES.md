# Contratos visuales React / Flutter — Fase 0.1

Estos contratos preservan equivalencia semántica entre tecnologías; no comparten widgets ni lógica de negocio.

| Contrato | Web React | Flutter | Regla |
| --- | --- | --- | --- |
| Tema | atributo `data-theme` + variables CSS | `ThemeData` por entorno | Mismos nombres semánticos, implementación independiente |
| Color | `--color-*` | constantes semánticas `Color` | Nunca color literal dentro de una pantalla sin token |
| Espacio/radio | `--radius-*` y escala 4 | constantes del sistema de diseño | Usar escala aprobada |
| Acción primaria | botón con foco visible | `FilledButton` | mínimo 48 dp en superficie táctil |
| Icono | Lucide | equivalente visual aprobado | etiqueta accesible si el icono no es decorativo |
| Estado | texto + icono + color | texto + icono + color | el color no es la única señal |

`scripts/validate-scaffold.mjs` verifica que los cuatro bloques CSS reflejen `colors.json`, que Flutter refleje los valores de `customer-warm` actualmente usados por la tableta y que el mínimo táctil coincida con `components.json`.

Los contratos de API, sesión, caché, NFC y pagos no pertenecen a esta entrega de identidad visual.
