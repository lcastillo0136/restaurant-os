# Wireframes — Fase 0.3

**Estado:** aprobado visualmente por el propietario el 2026-10-29. Continúa siendo un entregable estático: no implementa rutas de producción, autenticación, pedidos, pagos, NFC/QR, impresión ni integraciones.

## Cómo inspeccionarlos

El índice local es [design/wireframes/index.html](../../design/wireframes/index.html). Cada entorno tiene una página HTML independiente y direcciones por ancla, por ejemplo `design/wireframes/admin/index.html#ADM-03`.

- [Administración](../../design/wireframes/admin/index.html) — 10 pantallas.
- [Tableta de cliente](../../design/wireframes/tablet/index.html) — 12 pantallas.
- [Cocina KDS](../../design/wireframes/kds/index.html) — 7 pantallas.
- [Caja POS](../../design/wireframes/pos/index.html) — 10 pantallas.
- [Meseros](../../design/wireframes/waiter/index.html) — 7 pantallas.

El selector de pantalla y el selector de estado pertenecen exclusivamente al visor de diseño. Los botones dibujados dentro de una pantalla son anotaciones visuales y no ejecutan una operación. Esto evita representar una navegación productiva antes de la Fase 0.5.

## Fundamento visual y límites

- Se conservan las familias de tokens `admin-light`, `customer-warm`, `kitchen-dark` y `pos-light`, sin modificar sus JSON en `design/tokens/`.
- Administración mantiene la barra superior horizontal; no se dibuja un sidebar administrativo persistente.
- Tableta cliente y meseros son wireframes para Flutter Android: controles de 48 px como mínimo visual, superficies táctiles y sin destinos fuera de la mesa o del rol. La tableta cliente usa orientación vertical como diseño principal y conserva una variante horizontal adaptable; no presupone un modelo de hardware.
- KDS mantiene contraste oscuro y columnas operativas. POS mantiene rail lateral compacto y resumen de consumo persistente.
- Las cuatro referencias PNG oficiales se mantienen intactas y son las referencias visuales; los wireframes no las copian ni las sustituyen.
- Importes, nombres, fechas, mesas y órdenes son datos de ejemplo no transaccionales.

## Inventario de pantallas

Este es el **catálogo canónico** de identificadores de Fase 0.3. Cada ID aparece una sola vez y fija un único nombre, entorno y ruta prevista. La unicidad de ruta se valida dentro de cada aplicación/entorno; una ruta relativa como `/menu` puede existir en clientes distintos sin compartir navegación. `MAPA-PANTALLAS.md` conserva agrupaciones conceptuales, pero no redefine estos identificadores.

| ID | Nombre | Entorno | Rol | Plataforma | Ruta prevista | Flujo(s) | Estados / acción principal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ADM-01 | Inicio de sesión | Administración | empleado | React web | `/login` | F-01 | autenticación pendiente / error / sesión |
| ADM-02 | Dashboard general | Administración | administrador, gerente | React web | `/dashboard` | F-02, F-22 | lectura, carga, vacío, error |
| ADM-03 | Gestión de mesas y áreas | Administración | administrador, gerente, supervisor | React web | `/mesas` | F-05, F-20 | abrir/consultar mesa autorizada |
| ADM-04 | Detalle de mesa y sesión | Administración | administrador, gerente, supervisor | React web | `/mesas/:tableId` | F-05, F-13, F-15, F-20 | sesión, entrega, limpieza, conflicto |
| ADM-05 | Gestión de pedidos | Administración | administrador, gerente, supervisor | React web | `/pedidos` | F-10, F-11, F-12 | consultar, cancelar/modificar autorizado |
| ADM-06 | Menú y productos | Administración | administrador, gerente autorizado | React web | `/menu` | F-04 | formulario, validación, ACK |
| ADM-07 | Empleados, roles y horarios | Administración | administrador, gerente delegado | React web | `/personal` | F-01, F-02, F-03 | roles de alcance delegado |
| ADM-08 | Gestión de dispositivos | Administración | administrador, gerente autorizado | React web | `/ajustes/dispositivos` | F-06, F-07, F-20 | vínculo y liberación con permiso |
| ADM-09 | Reportes básicos | Administración | administrador, gerente autorizado | React web | `/reportes` | F-22 | carga, vacío, filtro, sin permiso |
| ADM-10 | Configuración general | Administración | administrador | React web | `/ajustes` | F-03 | cambios pendientes / extensiones futuras |
| TAB-01 | Bienvenida de mesa | Tableta cliente | invitado, dispositivo de mesa | Flutter Android | `/bienvenida` | F-06, F-07 | acceso invitado; NFC/QR no disponible |
| TAB-02 | Acceso como invitado | Tableta cliente | invitado | Flutter Android | `/acceso/invitado` | F-06 | espera de servidor / sesión inválida |
| TAB-03 | Menú y categorías | Tableta cliente | invitado | Flutter Android | `/menu` | F-08 | catálogo, vacío, carga, offline visual |
| TAB-04 | Búsqueda de productos | Tableta cliente | invitado | Flutter Android | `/menu/buscar` | F-08 | resultados, vacío, producto no disponible |
| TAB-05 | Detalle de platillo | Tableta cliente | invitado | Flutter Android | `/menu/:productId` | F-08, F-09 | alérgenos, disponibilidad, volver |
| TAB-06 | Selección de complementos | Tableta cliente | invitado | Flutter Android | `/menu/:productId/complementos` | F-09 | validación de modificadores |
| TAB-07 | Carrito | Tableta cliente | invitado | Flutter Android | `/carrito` | F-09, F-10 | borrador local; no confirmado |
| TAB-08 | Confirmación de pedido | Tableta cliente | invitado | Flutter Android | `/pedido/confirmar` | F-10 | pendiente ACK, confirmado, conflicto |
| TAB-09 | Seguimiento del pedido | Tableta cliente | invitado | Flutter Android | `/pedido/estado` | F-11, F-12, F-13 | recibido, cocina, listo, entrega |
| TAB-10 | Consumo actual | Tableta cliente | invitado | Flutter Android | `/consumo` | F-15 | lectura propia, actualización, offline |
| TAB-11 | Solicitud de mesero | Tableta cliente | invitado | Flutter Android | `/atencion` | F-14 | solicitud pendiente / ACK / error |
| TAB-12 | Cierre y reinicio de sesión pública | Tableta cliente | dispositivo de mesa | Flutter Android | `/fin-de-visita` | F-20 | cierre y liberación solo por ACK |
| KDS-01 | Tablero principal | Cocina KDS | chef, auxiliar | React web | `/kds/tablero` | F-11, F-12 | columnas y tarjetas por estación |
| KDS-02 | Filtro por estación | Cocina KDS | chef, auxiliar | React web | `/kds/tablero?station=:stationId` | F-11, F-12 | estación permitida / sin permiso |
| KDS-03 | Detalle de pedido | Cocina KDS | chef, auxiliar | React web | `/kds/pedidos/:ticketId` | F-11, F-12 | ítems, nota, alérgeno, ACK |
| KDS-04 | Inicio de preparación | Cocina KDS | chef, auxiliar autorizado | React web | `/kds/pedidos/:ticketId/iniciar` | F-12 | pendiente → preparando tras ACK |
| KDS-05 | Pedido listo | Cocina KDS | chef, auxiliar autorizado | React web | `/kds/pedidos/:ticketId/listo` | F-12, F-13 | listo tras ACK; sin cobro |
| KDS-06 | Historial de pedidos atendidos | Cocina KDS | chef, auxiliar autorizado | React web | `/kds/historial` | F-11, F-12, F-13 | historial/auditoría de consulta |
| KDS-07 | Desconexión y recuperación | Cocina KDS | chef, auxiliar | React web | `/kds/recuperacion` | F-11, F-12 | snapshot de estación / mutación bloqueada |
| POS-01 | Selección de mesa o cuenta | Caja POS | cajero | React web | `/pos/cuentas` | F-15, F-17 | cuenta activa/vacía, resumen persistente |
| POS-02 | Detalle de consumo | Caja POS | cajero, gerente autorizado | React web | `/pos/cuentas/:sessionId` | F-15, F-17, F-18 | lectura y método de pago |
| POS-03 | Selección de método de pago | Caja POS | cajero | React web | `/pos/cuentas/:sessionId/pago` | F-16, F-17 | efectivo MVP; tarjeta/división posterior |
| POS-04 | Cobro en efectivo | Caja POS | cajero | React web | `/pos/cuentas/:sessionId/efectivo` | F-17 | importe, cambio, solicitud ACK |
| POS-05 | Registro de propina | Caja POS | cajero | React web | `/pos/cuentas/:sessionId/propina` | F-18 | propina separada, validación |
| POS-06 | Confirmación de pago | Caja POS | cajero | React web | `/pos/cuentas/:sessionId/confirmacion` | F-17, F-18 | pendiente / reconciliación; no recibo aún |
| POS-07 | Ticket | Caja POS | cajero | React web | `/pos/tickets/:receiptId` | F-19 | impresión/reintento tras pago confirmado |
| POS-08 | Apertura de caja | Caja POS | cajero | React web | `/pos/apertura` | F-02 | solicitud de apertura y ACK |
| POS-09 | Cierre y arqueo de caja | Caja POS | cajero, gerente cuando aplique | React web | `/pos/cierre` | F-21 | diferencia visible, borrador, ACK |
| POS-10 | Errores y operaciones pendientes | Caja POS | cajero | React web | `/pos/pendientes` | F-17, F-19, F-21 | reconciliar, impresión, contingencia |
| WAI-01 | Acceso del empleado | Meseros | mesero | Flutter Android | `/mesero/login` | F-01, F-02 | login/turno; no experiencia pública |
| WAI-02 | Mesas asignadas | Meseros | mesero | Flutter Android | `/mesero/salon` | F-05, F-14 | salón y solicitudes asignadas |
| WAI-03 | Detalle de mesa | Meseros | mesero | Flutter Android | `/mesero/mesas/:tableId` | F-05, F-13, F-15, F-20 | consulta, pedido, entrega, cierre autorizado |
| WAI-04 | Registro de pedidos | Meseros | mesero | Flutter Android | `/mesero/mesas/:tableId/pedido` | F-08, F-09, F-10 | carrito, envío pendiente ACK |
| WAI-05 | Seguimiento de pedidos | Meseros | mesero | Flutter Android | `/mesero/pedidos` | F-11, F-12, F-13 | estado de cocina y entrega |
| WAI-06 | Solicitudes de clientes | Meseros | mesero | Flutter Android | `/mesero/solicitudes` | F-14 | atención por mesa, no duplicación |
| WAI-07 | Entrega de alimentos | Meseros | mesero | Flutter Android | `/mesero/pedidos/:orderId/entrega` | F-13 | entrega pendiente/confirmada |

## Estados UX representados

Todos los destinos del visor incluyen el selector de muestra de estados. Los estados exigidos son `normal`, `vacío`, `cargando`, `error`, `sin conexión`, `pendiente de ACK`, `muestra: ACK recibido` y `sin permiso`; también se incluyen `validación`, `conflicto por modificación simultánea` y `acción cancelada` definidos durante Fase 0.2. Pendiente, desconexión y ACK usan una capa que oculta indicadores subyacentes para evitar mensajes contradictorios.

| Contexto crítico | Norma visual de la muestra |
| --- | --- |
| Pedido (cliente o mesero) | `Pendiente ACK` no muestra número confirmado, cocina ni éxito. `ACK confirmado` está etiquetado como resultado del servidor. |
| KDS | Una tarjeta no cambia realmente de columna; las muestras enseñan que el cambio sigue al ACK/version. Sin conexión bloquea las transiciones y solicita snapshot. |
| Cobro, propina y caja | Pendiente, timeout y error no habilitan ticket ni cierre. Se ofrece reconciliación, no reintento ciego. |
| Mesa y dispositivo | Conflicto o falta de permiso impiden liberar/reasignar. La tableta se mantiene en un estado seguro y nunca enseña otra mesa. |
| Formularios administrativos | Error de validación conserva el formulario; conflicto pide recuperar la versión del servidor antes de volver a enviar. |

## Cobertura de navegación y flujos

La correspondencia detallada está en la tabla de inventario. Todos los flujos F-01 a F-22 tienen una representación o punto de extensión explícito:

- **F-01 a F-05:** ADM-01, ADM-03 a ADM-07 y WAI-01 a WAI-04.
- **F-06 a F-10:** TAB-01 a TAB-08, ADM-08 y WAI-04.
- **F-11 a F-15:** KDS-01 a KDS-07, TAB-09 a TAB-11, WAI-02 a WAI-07 y POS-01/POS-02.
- **F-16:** POS-03 lo señala inactivo porque la división de cuenta es posterior al MVP; no se diseña como operación disponible.
- **F-17 a F-21:** POS-01 a POS-10, ADM-03/ADM-04 y TAB-12 donde corresponda.
- **F-22:** ADM-02 y ADM-09.
- **F-07:** TAB-01 y ADM-08 reservan el punto de entrada para NFC/QR; no presentan lector ni resultado funcional.

No se detectaron rutas de wireframe sin destino en el visor: cada identificador aparece en su menú lateral y tiene una ruta prevista declarada. No hay respuesta de negocio para los botones dibujados, por decisión de alcance; el único cambio interactivo permitido en el visor es seleccionar otra pantalla o estado de muestra.

## Decisiones pendientes que los wireframes no resuelven

1. Validación visual final de valores específicos de tokens.
2. Reglas de cancelación/modificación tras envío, límites y doble autorización de descuentos.
3. Política de diferencias de caja, tolerancias y segunda autorización.
4. Reglas de división de cuentas, mezcla de pagos y reembolsos posteriores.
5. Política de expiración/liberación de sesión pública y dispositivo de mesa.
6. Hardware aprobado para NFC/QR, impresora y dispositivos Android.

Estas decisiones continúan en [10-PENDIENTES.md](../10-PENDIENTES.md) y no se convierten en comportamiento por efecto de los wireframes.

## Validación y evidencia

- Validación automatizada: `node scripts/validate-phase-0.3.mjs` comprueba 46 IDs/nombres/entornos/rutas, recursos locales, JavaScript, objetivos táctiles, orientación, estados ACK, POS contextual, tokens y hashes oficiales.
- Validación de sintaxis: `node --check design/wireframes/assets/wireframe.js` y `node --check scripts/validate-phase-0.3.mjs`, correctas.
- Capturas reales: dashboard, bienvenida vertical, menú vertical, KDS, POS y mesero generadas con Chrome headless contra `127.0.0.1`; no se usaron imágenes artificiales.
- La evidencia visual y los comandos ejecutados se conservan en [design/validation/phase-0.3/README.md](../../design/validation/phase-0.3/README.md).

## Límite de fase

La revisión visual de estos wireframes fue aprobada por el propietario el 2026-10-29. La aprobación cierra la Fase 0.3, pero no inicia automáticamente la Fase 0.4 ni autoriza desarrollo funcional; cualquier etapa posterior requiere una instrucción expresa.
