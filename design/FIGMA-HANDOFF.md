# Guía de traspaso de diseño
1. Crea páginas: `00 Foundations`, `01 Admin`, `02 Table Flutter`, `03 Kitchen`, `04 POS`, `05 Flows`, `06 Components`.
2. Importa los cuatro PNG oficiales de `design/reference/` en marcos con tamaños documentados. No uses `design/svg/` para sustituirlos ni recrear su contenido.
3. Usa `design/tokens/` como fuente de tokens, contrastes AA, escalas 4/8 y targets 48dp. `design/tokens.json` es solo el manifiesto de compatibilidad.
4. Cada pantalla debe tener estados: cargando, vacío, error, sin red, operación pendiente, éxito, sesión cerrada.
5. En Flutter: layouts adaptativos 800–1280 px de ancho típico de tablet, verificar físicamente; no asumir ratio fijo.
6. En desktop admin: 1440x900 base, responsivo >=1024; POS y cocina pantallas dedicadas.
7. Antes de código de negocio: diseño aprobado + prototipo de abrir mesa, crear pedido y cerrar cuenta.
