# Restaurant OS — Revisión visual Fase 0.3

Este paquete contiene los 46 wireframes estáticos de la Fase 0.3 y su documentación de navegación y estados. No contiene dependencias instaladas, builds, backend, datos reales ni lógica de negocio.

## Requisitos

- Node.js 20 o posterior.
- Un navegador moderno.
- No se requiere ejecutar `npm install`, `pnpm install`, Docker ni un servicio externo.

## Abrir el visor mediante HTTP local

1. Extrae el ZIP conservando su estructura de carpetas.
2. Abre una terminal en la carpeta extraída.
3. Ejecuta:

   ```powershell
   node scripts/serve-wireframes-review.mjs
   ```

4. Abre `http://127.0.0.1:4180/` en el navegador.
5. Al terminar, vuelve a la terminal y pulsa `Ctrl+C`.

El servidor usa únicamente módulos integrados de Node, escucha solo en `127.0.0.1` y sirve exclusivamente `design/wireframes/`. No publica el visor en la LAN ni realiza solicitudes externas.

Si el puerto 4180 está ocupado, establece otro antes de iniciar:

```powershell
$env:PORT=4181
node scripts/serve-wireframes-review.mjs
```

## Recorrido sugerido

1. El índice presenta los cinco entornos: Administración, Tableta cliente, Cocina KDS, Caja POS y Meseros.
2. Selecciona un entorno para abrir su primer wireframe.
3. Usa la lista izquierda del visor para recorrer todos los identificadores del entorno.
4. En Tableta cliente, revisa primero `Vertical · principal` y después la variante `Horizontal · adaptable`.
5. En cada pantalla, usa `Estado de muestra` para revisar normal, vacío, carga, error, desconexión, pendiente de ACK, muestra de ACK recibido, permiso insuficiente, validación, conflicto y cancelación.
6. Usa `Índice` en la barra superior para volver a los cinco entornos.

Inventario esperado:

- `ADM-01` a `ADM-10`: 10 pantallas.
- `TAB-01` a `TAB-12`: 12 pantallas.
- `KDS-01` a `KDS-07`: 7 pantallas.
- `POS-01` a `POS-10`: 10 pantallas.
- `WAI-01` a `WAI-07`: 7 pantallas.

Total: **46 pantallas**.

## Alcance de la revisión

- Los botones internos son anotaciones visuales; no ejecutan operaciones.
- `Pendiente de ACK` y `ACK confirmado` son muestras deliberadas de estado, no respuestas de un backend.
- NFC/QR, tarjeta, CFDI, reembolsos y división avanzada continúan como funciones posteriores no operativas.
- Las políticas pendientes de descuentos, cancelaciones, caja y liberación de dispositivos no se resuelven en este paquete.
- La Fase 0.3 fue **aprobada visualmente por el propietario el 2026-10-29**. Esta aprobación no inicia automáticamente la Fase 0.4.

## Documentación incluida

- `docs/design/WIREFRAMES.md`
- `docs/design/MAPA-PANTALLAS.md`
- `docs/design/NAVEGACION.md`
- `docs/design/ESTADOS-UX.md`
