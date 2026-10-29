# Prototipos interactivos — Fase 0.5

**Estado:** implementación y validación técnica completadas; pendiente de revisión y aprobación del propietario. Las Fases 0.1 a 0.4 fueron aprobadas expresamente. No se inicia Fase 0.6.

**Fecha:** 2026-10-29.

## Alcance

Los prototipos añaden navegación y respuestas simuladas sobre las capturas exactas de los 46 mockups aprobados. La implementación está aislada en `design/prototypes/phase-0.5/` y no modifica aplicaciones React/Flutter, backend, base de datos, tokens, referencias ni fuentes de Fase 0.4.

No existe API, WebSocket, persistencia, autenticación real, pago, comprobante fiscal, impresión, NFC/QR, CFDI ni operación productiva. Los datos viven en memoria hasta que se recarga o se pulsa `Restablecer demo`.

## Arquitectura del artefacto

| Recurso | Propósito |
| --- | --- |
| `index.html` | índice general de cinco entornos |
| `admin/index.html` | navegación administrativa simulada |
| `tablet/index.html` | recorrido público de tableta, vertical principal y adaptación horizontal |
| `kds/index.html` | transiciones KDS con ACK simulado |
| `pos/index.html` | apertura, efectivo, propina, ticket y arqueo simulados |
| `waiter/index.html` | recorrido interno de mesero |
| `assets/screen-catalog.js` | catálogo canónico derivado de los 46 IDs/rutas |
| `assets/demo-data.js` | datos ficticios centralizados con `organizationId`, `branchId` y MXN |
| `assets/engine.js` | motor en memoria, ACK explícito, rechazo, estados y reinicio |
| `assets/prototype.js` | capa visual, navegación, panel de acciones y estados |
| `assets/screens/` | copias binarias verificadas de las 47 capturas aprobadas de Fase 0.4 |
| `assets/tokens.css` | copia binaria de la traducción aprobada de los siete tokens |

El prototipo presenta la referencia visual como imagen inmutable. Las acciones y estados aparecen en una capa exterior claramente marcada `PROTOTIPO · DATOS FICTICIOS`; así se conserva el diseño aprobado sin convertir la captura en interfaz productiva.

## Inventario

| Entorno | IDs | Entrada | Recorrido principal |
| --- | --- | --- | --- |
| Administración | `ADM-01` a `ADM-10` | `admin/index.html#ADM-01` | login demo → dashboard → mesas/detalle → pedidos/menú → personal/dispositivos → reportes/ajustes |
| Tableta cliente | `TAB-01` a `TAB-12` | `tablet/index.html#TAB-01` | bienvenida/idioma → invitado → menú/búsqueda/producto/complementos → carrito/confirmación → estado/atención/consumo → cierre demo |
| Cocina KDS | `KDS-01` a `KDS-07` | `kds/index.html#KDS-01` | tablero/filtro/detalle → inicio ACK → listo ACK → entrega/historial → desconexión/reconexión |
| Caja POS | `POS-01` a `POS-10` | `pos/index.html#POS-08` | apertura ACK → cuenta/consumo/efectivo/propina → pago ACK → ticket demo → cierre/pendientes |
| Meseros | `WAI-01` a `WAI-07` | `waiter/index.html#WAI-01` | acceso → mesas/detalle → captura/envío ACK → seguimiento/solicitudes → entrega ACK |

Los 46 títulos y rutas coinciden campo por campo con `WIREFRAMES.md`. `TAB-03` cambia entre la captura vertical y `TAB-03-horizontal.png` sin crear un identificador adicional.

## Recorridos interactivos

### Administración

1. `ADM-01` solicita un acceso ficticio y muestra `Pendiente de ACK`.
2. `Emitir ACK simulado` habilita el dashboard de demostración.
3. Dashboard enlaza mesas, pedidos y reportes.
4. Mesas permite seleccionar `Mesa 04` o simular apertura de `Mesa 01` mediante ACK.
5. Pedidos no permite cancelación real; el caso de permiso insuficiente es demostrable.
6. Menú simula validación y guardado de un producto ficticio.
7. Personal, dispositivos, reportes y ajustes conservan sus rutas y estados documentales.

### Tableta cliente

1. Bienvenida permite seleccionar idioma ficticio y alternar orientación.
2. Acceso invitado no activa sesión hasta resolver el ACK simulado.
3. Menú permite ir a búsqueda, detalle y carrito.
4. Complementos valida selección y agrega dos líneas ficticias por ACK.
5. Confirmación conserva `NO CONFIRMADO` hasta emitir el ACK; después crea `ORDER-DEMO-1284` solo en memoria.
6. Seguimiento enlaza atención y consumo.
7. Solicitud de mesero requiere otro ACK simulado.
8. Cierre restablece sesión y carrito ficticios tras ACK.
9. NFC/QR permanece visible como función futura no operativa.

### Cocina KDS

1. Tablero enlaza filtro, detalle y desconexión.
2. Inicio, listo y entrega se representan como intenciones separadas.
3. La tarjeta solo cambia en los datos ficticios después de `Emitir ACK simulado`.
4. Desconexión bloquea `begin()` y conserva el snapshot.
5. Reconexión recupera el tablero mediante ACK simulado; no consulta servidor.

### Caja POS

1. El recorrido comienza en apertura de caja; el turno ficticio no se abre sin ACK.
2. Cuenta y consumo conducen únicamente al método efectivo del MVP.
3. Propina voluntaria se almacena separada en los datos demo.
4. Pago permanece pendiente hasta ACK; timeout conduce a operaciones pendientes.
5. Ticket se habilita después del ACK simulado y muestra obligatoriamente `DOCUMENTO DE DEMOSTRACIÓN — SIN VALIDEZ FISCAL`.
6. Cierre conserva diferencia visible y no se declara exitoso sin ACK.
7. Tarjeta, división y CFDI permanecen no operativos.

### Meseros

1. Acceso demo confirma rol de mesero mediante ACK.
2. Salón enlaza mesa, seguimiento y solicitudes.
3. El pedido capturado no se envía hasta ACK simulado.
4. Solicitudes se atienden sin duplicar ni persistir datos.
5. Entrega cambia a `delivered` únicamente después del ACK simulado.

## Estados simulados

| Estado | Respuesta del prototipo |
| --- | --- |
| Normal | muestra la captura aprobada y acciones del recorrido |
| Vacío | explica ausencia ficticia sin eliminar navegación |
| Cargando | representa recuperación de snapshot sin solicitud de red |
| Error | declara que no hubo confirmación |
| Sin conexión | bloquea mutaciones y marca snapshot como ficticio/desactualizado |
| Pendiente de ACK | muestra identificador `DEMO-*`, intención y `NO CONFIRMADO` |
| ACK simulado | muestra confirmación explícitamente demostrativa |
| Permiso insuficiente | no aplica cambios ni revela información adicional |
| Validación | conserva estado y solicita corrección de campos ficticios |
| Conflicto | exige recuperar una versión ficticia antes de reintentar |
| Cancelación | descarta la intención sin mutación |

En una operación pendiente, el revisor puede emitir ACK simulado, error o conflicto. Offline impide iniciar una mutación. `Restablecer demo` devuelve datos, orientación y pantalla inicial del entorno.

## Datos ficticios

- Organización `org_demo_001` y sucursal `branch_demo_centro`.
- Empleado `EMP-DEMO-014` y nombre explícito `Jorge Demo`.
- Mesas `M01`, `M04`, `M07`, `M09`.
- Cuatro productos genéricos, importes numéricos en MXN.
- Pedido `ORDER-DEMO-1284`, ticket KDS `KOT-DEMO-1284` y recibo `TICKET-DEMO-8492` solo después de ACK simulado.
- Caja `CAJA-DEMO-01`, fondo y conteo ilustrativos.

No se usa información personal real, almacenamiento del navegador ni transmisión de datos.

## Validaciones ejecutadas

- `node --check` sobre los cuatro módulos de prototipo y los scripts de validación: correcto.
- `node scripts/test-phase-0.5-navigation.mjs`: correcto; 46 destinos, 11 estados y cinco recorridos con ACK simulado.
- `node scripts/validate-phase-0.5.mjs`: correcto; 46 IDs/títulos/rutas, 47 imágenes idénticas, cinco entornos, datos demo, reinicio, offline, cero red/persistencia y ocho PNG.
- `node scripts/test-phase-0.5-http.mjs`: correcto; 15 recursos respondieron HTTP `200` y una ruta inexistente `404`.
- `node scripts/validate-phase-0.4-delivery-2.mjs`, `node scripts/validate-phase-0.3.mjs` y `node scripts/validate-scaffold.mjs`: correctos; no hubo regresión.
- Capturas reales generadas con Microsoft Edge Chromium headless contra `127.0.0.1:4197`; no se utilizaron imágenes artificiales.
- Auditoría del ZIP: extracción independiente con 140 archivos, 47 superficies visuales, ocho capturas, cero rutas excluidas, pruebas de navegación/validación correctas y servidor HTTP correcto. El SHA-256 se publica fuera del propio archivo.

## Evidencia visual

| Captura | Contenido |
| --- | --- |
| `captures/INDEX.png` | índice general |
| `captures/ADM-03.png` | mesas administrativas |
| `captures/TAB-08.png` | confirmación de pedido con contexto ficticio coherente |
| `captures/KDS-04.png` | inicio de preparación |
| `captures/POS-06.png` | pago no confirmado |
| `captures/WAI-04.png` | captura de pedido por mesero |
| `captures/ACK-SIMULADO.png` | resultado etiquetado de ACK simulado |
| `captures/TICKET-DEMO.png` | ticket con leyenda fiscal obligatoria |

## Decisiones y pendientes

1. Los prototipos reutilizan capturas aprobadas como superficies inmutables; no son código de producción ni sustituyen React/Flutter.
2. La advertencia de tipo de módulo de Node se eliminó con un `package.json` local sin dependencias y `type: module`; no altera el monorepo.
3. Continúan pendientes fotografía licenciada, fuente Inter definitiva, hardware representativo, políticas de cancelación/descuento/reembolso/división y autorizaciones de cierre.
4. Git no puede auditarse porque el directorio del proyecto no contiene metadata `.git`.
5. La Fase 0.5 requiere aprobación expresa antes de comenzar Fase 0.6.
