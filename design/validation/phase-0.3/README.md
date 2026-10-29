# Evidencia de validación — Fase 0.3

## Artefactos inspeccionables

Los wireframes estáticos se encuentran en `design/wireframes/`; el punto de entrada es `design/wireframes/index.html`. No requieren backend, datos reales ni integraciones para inspeccionar las pantallas y sus estados de muestra.

## Capturas PNG

Se generaron capturas reales con Google Chrome en modo headless contra el servidor estático ligado exclusivamente a `127.0.0.1`. No son imágenes generadas artificialmente y no sustituyen las cuatro referencias oficiales.

- `01-dashboard.png` — ADM-02 Dashboard general.
- `02-bienvenida-vertical.png` — TAB-01 Bienvenida de mesa, orientación vertical principal.
- `03-menu-vertical.png` — TAB-03 Menú y categorías, orientación vertical principal.
- `04-kds.png` — KDS-01 Tablero principal.
- `05-pos.png` — POS-03 Selección de método de pago con resumen persistente.
- `06-mesero.png` — WAI-02 Mesas asignadas.

El servidor y los perfiles temporales del navegador fueron detenidos/eliminados después de la captura.

## Validaciones ejecutadas

- `node --check design/wireframes/assets/wireframe.js`: correcto.
- `node --check scripts/validate-phase-0.3.mjs`: correcto.
- `node scripts/validate-phase-0.3.mjs`: correcto.
- `node scripts/validate-scaffold.mjs`: correcto; 29 rutas, siete tokens y cuatro temas sincronizados.
- Inventario: 46 identificadores canónicos, nombres, entornos y rutas consistentes entre `WIREFRAMES.md`, `MAPA-PANTALLAS.md` y el visor en cinco entornos.
- Estados: once muestras UX disponibles; pendiente, desconexión y ACK ocultan contenido subyacente potencialmente contradictorio.
- Tableta: vertical principal y horizontal adaptable, sin asumir hardware definitivo.
- Táctil: controles productivos revisados con objetivo mínimo de 48 px; controles exclusivos del visor quedan fuera de esta regla.
- Tokens/referencias: siete JSON canónicos válidos y cuatro hashes oficiales coincidentes.
- Paquete: 14/14 archivos permitidos; SHA-256 `68EC3A77436A38E64FCEC7901EA5CDD6B66A7944B0A06CD5103191F5C49BF49F`.

## Incidencia de empaquetado

Una primera invocación de `Compress-Archive -LiteralPath` con comodín falló porque PowerShell no expande `*` en ese parámetro; no produjo un ZIP parcial. Se repitió con `-Path`, se verificaron las 14 entradas y se eliminó el directorio temporal de ensamblado.
