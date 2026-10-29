# Restaurant OS — Revisión Fase 0.4, Entrega 1

Este paquete contiene seis mockups estáticos de alta fidelidad, una variante horizontal de tableta, siete capturas reales y la documentación de cierre técnico. No contiene backend, dependencias instaladas, lógica de negocio ni recursos externos obligatorios.

## Abrir el visor

Requisitos: Node.js 20 o posterior y un navegador moderno. No es necesario ejecutar `npm install`, `pnpm install`, Docker ni conectarse a internet.

1. Extrae el ZIP conservando su estructura.
2. Abre una terminal en la carpeta extraída.
3. Ejecuta:

   ```powershell
   node scripts/serve-phase-0.4-review.mjs
   ```

4. Abre `http://127.0.0.1:4190/`.
5. Al terminar, presiona `Ctrl+C` en la terminal.

El servidor utiliza únicamente módulos integrados de Node, escucha exclusivamente en `127.0.0.1` y sirve `design/mockups/phase-0.4/`.

Si el puerto está ocupado:

```powershell
$env:PORT=4191
node scripts/serve-phase-0.4-review.mjs
```

## Recorrido

- `ADM-02`: dashboard administrativo.
- `TAB-01`: bienvenida de tableta.
- `TAB-03`: menú y categorías; usa el control del visor para alternar vertical/horizontal.
- `KDS-01`: tablero principal de cocina.
- `POS-03`: selección de método de pago.
- `WAI-02`: mesas asignadas al mesero.

Los botones dentro de las pantallas son parte del mockup y no ejecutan acciones. Los productos, importes, personas, mesas y métricas son ficticios. Las ilustraciones de comida son SVG locales marcados como demostración.

## Estado

La Entrega 1 está pendiente de aprobación visual del propietario. No autoriza extender los mockups a las otras 40 pantallas ni iniciar Fase 0.5.
