# Mockups de alta fidelidad — Fase 0.4, Entregas 1 y 2

**Estado:** Entrega 1 aprobada formalmente por el propietario. Entrega 2 completada y validada técnicamente con los 40 mockups restantes; **pendiente de aprobación visual**. No se inicia Fase 0.5.

**Fecha de cierre técnico:** 2026-10-29.

## Alcance

La Entrega 1 transformó seis wireframes aprobados de Fase 0.3 en especificaciones visuales de alta fidelidad. La Entrega 2 extiende el mismo lenguaje a los 40 identificadores restantes, sin modificar los seis mockups aprobados ni su variante horizontal. El visor es HTML/CSS/JavaScript estático y no implementa rutas productivas, autenticación, pedidos, cocina, cobros, NFC/QR, facturación, persistencia ni integraciones.

Los archivos fuente se encuentran en `design/mockups/phase-0.4/`; el punto de entrada es `design/mockups/phase-0.4/index.html`.

## Inventario visual

| ID | Pantalla | Plataforma / rol | Resolución de referencia | Archivo fuente | Captura real | Wireframe de origen | Referencia visual |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ADM-02` | Dashboard general | React web · administrador/gerente | 1440 × 900 | `design/mockups/phase-0.4/admin/index.html#ADM-02` | `captures/ADM-02.png` (1600 × 1000) | `design/wireframes/admin/index.html#ADM-02` | `01-admin-aprobado.png` |
| `TAB-01` | Bienvenida de mesa | Flutter Android · invitado/dispositivo de mesa | 800 × 1280, vertical principal | `design/mockups/phase-0.4/tablet/index.html#TAB-01` | `captures/TAB-01.png` (1100 × 1280) | `design/wireframes/tablet/index.html#TAB-01` | `02-tablet-aprobado.png` |
| `TAB-03` | Menú y categorías | Flutter Android · invitado con sesión confirmada | 800 × 1280, vertical principal | `design/mockups/phase-0.4/tablet/index.html#TAB-03` | `captures/TAB-03.png` (1100 × 1280) | `design/wireframes/tablet/index.html#TAB-03` | `02-tablet-aprobado.png` |
| `TAB-03` | Variante horizontal adaptable | Flutter Android · misma pantalla | adaptación 1280 × 800 | parámetro `?orientation=landscape&screen=TAB-03` | `captures/TAB-03-horizontal.png` (1280 × 1280, dispositivo completo) | mismo wireframe; no crea un ID nuevo | `02-tablet-aprobado.png` |
| `KDS-01` | Tablero principal | React web · chef/auxiliar | 1600 × 900 | `design/mockups/phase-0.4/kds/index.html#KDS-01` | `captures/KDS-01.png` (1600 × 900) | `design/wireframes/kds/index.html#KDS-01` | `03-kds-aprobado.png` |
| `POS-03` | Selección de método de pago | React web · cajero | 1440 × 900 | `design/mockups/phase-0.4/pos/index.html#POS-03` | `captures/POS-03.png` (1440 × 900) | `design/wireframes/pos/index.html#POS-03` | `04-pos-aprobado.png` |
| `WAI-02` | Mesas asignadas | Flutter Android · mesero | 412 × 915 | `design/mockups/phase-0.4/waiter/index.html#WAI-02` | `captures/WAI-02.png` (1000 × 1280) | `design/wireframes/waiter/index.html#WAI-02` | sistema compartido; adaptación interna de principios 01/02 |

Las dimensiones del PNG incluyen el lienzo de presentación cuando la especificación representa un dispositivo físico. La resolución declarada dentro de cada mockup sigue siendo la referencia de implementación.

## Decisiones visuales aplicadas

### Colores y temas

- `ADM-02` consume `admin-light`: fondo gris claro, superficies blancas, texto neutral y acento naranja usado selectivamente.
- `TAB-01` y `TAB-03` consumen `customer-warm`: fondo cálido, tarjetas blancas, acento terracota y texto café oscuro.
- `KDS-01` consume `kitchen-dark`: fondo oscuro, superficies elevadas, alto contraste y semántica verde/ámbar/rojo acompañada de texto e iconos.
- `POS-03` consume `pos-light`: superficies claras, acento violeta, selección oscura explícita y resumen de consumo estable.
- `WAI-02` reutiliza `customer-warm` con semántica operativa. No introduce una quinta identidad visual ni copia la experiencia pública de la tableta.

`assets/tokens.css` es una traducción estática verificable de los JSON canónicos, no una segunda fuente de verdad. `scripts/validate-phase-0.4.mjs` compara los valores de los cuatro temas con `design/tokens/colors.json` y el objetivo táctil con `components.json`.

### Tipografía

- Familia propuesta: Inter con fallback de sistema, conforme a `typography.json`.
- Inter no se incluye como archivo de fuente: origen y licencia continúan pendientes. En el visor se usa el fallback instalado cuando Inter no está disponible.
- Jerarquía: display de 38–46 px en pantallas principales, títulos de 24–32 px, cuerpo de 16 px o equivalente escalado en dispositivos y etiquetas semibold.
- Importes y métricas usan numerales tabulares cuando corresponde.

### Espaciado, bordes y elevación

- Escala basada en múltiplos de 4 px, con separaciones recurrentes de 8, 12, 16, 20, 24, 32, 40 y 48.
- Radios `sm`, `md`, `lg` y `xl` se aplican a controles, tarjetas, paneles y shells de dispositivo.
- La elevación se limita a los niveles 1 y 2 aprobados; la jerarquía depende principalmente de espaciado, contraste y agrupación.
- Los controles táctiles productivos de tableta, meseros, KDS y POS alcanzan al menos 48 px. Los controles exclusivos del visor no representan producto.

### Iconografía

- El visor utiliza iconos SVG de trazo simple escritos localmente dentro de `mockups.js` para esta especificación.
- No se descargó ni incorporó un paquete externo. Son placeholders de iconografía hasta confirmar la importación/licencia de Lucide y su equivalente Flutter.
- Todo estado relevante combina texto, forma/icono y color.

### Navegación y jerarquía

- Administración conserva exclusivamente la navegación horizontal superior aprobada.
- Tableta presenta orientación vertical principal, acción de invitado prominente, categorías táctiles y carrito persistente; la variante horizontal se adapta sin cambiar el ID.
- KDS conserva barra operativa y tres columnas `Pendiente`, `Preparando` y `Listo` con tarjetas legibles a distancia.
- POS conserva rail lateral compacto, métodos de pago en el centro y resumen persistente a la derecha.
- Meseros utiliza navegación inferior móvil, filtros operativos y tarjetas de mesas asignadas; no muestra destinos administrativos ni públicos.

## Componentes visuales identificados

| Componente | Entornos | Variantes representadas |
| --- | --- | --- |
| Barra de producto / identidad | todos | escritorio, tableta pública, móvil interno, KDS |
| Navegación | admin, tablet, KDS, POS, waiter | navbar superior, categorías, tabs de tablero, rail, barra inferior |
| Botón | todos | primario, secundario, texto, deshabilitado, acción operativa |
| Tarjeta | todos | KPI, panel analítico, producto, ticket, método de pago, mesa |
| Indicador / chip | todos | LAN, sesión, tiempo, estado, disponibilidad, posterior al MVP |
| Resumen persistente | tablet, POS | carrito local, consumo de cuenta |
| Visualización | admin | línea, distribución de estados y barras de ocupación con datos demo |
| Estado de operación | KDS, POS, tablet | pendiente/ACK explicado; ningún éxito transaccional ficticio |
| Ilustración de producto | tablet | SVG local marcado `Ilustración demo` / `Imagen demo` |

Estos patrones son candidatos para la posterior Fase 0.6; esta entrega no crea componentes productivos ni modifica los paquetes React/Flutter.

## Correspondencia con las referencias oficiales

### Administración — `01-admin-aprobado.png`

Se preservan el lienzo claro, las superficies blancas redondeadas, la navegación horizontal tipo píldora, la lectura amplia de métricas y los acentos naranjas en gráficas. Se excluyen la marca, avatar, ciudades, fechas y cifras de la referencia. Los datos mostrados están etiquetados como ficticios.

### Tableta — `02-tablet-aprobado.png`

Se traslada la jerarquía del kiosco a una superficie Android independiente del hardware: bienvenida, idioma, acción principal, búsqueda, categorías y catálogo visual. El pedestal, restaurante fotografiado, lector y marca de la imagen no se reutilizan. NFC/QR permanece como extensión futura no operativa.

### Cocina — `03-kds-aprobado.png`

Se conserva el tablero oscuro horizontal, la barra operativa, las tres columnas, tarjetas claras, tiempos visibles y acciones grandes. No se copian marca, personas, órdenes, productos ni textos. Toda transición declara que la tarjeta cambia de columna solo después de un ACK.

### Caja — `04-pos-aprobado.png`

Se conservan el rail lateral compacto, las opciones de pago centrales, la selección explícita y el resumen estable a la derecha. Solo efectivo aparece disponible; tarjeta y división están marcadas como posteriores. Elegir efectivo no se presenta como cobro confirmado.

### Meseros

No existe una quinta referencia oficial. `WAI-02` combina neutralidad operativa de administración con superficies cálidas compartidas de Flutter, manteniendo una identidad interna claramente distinta de la experiencia pública.

## Recursos gráficos y licencias

| Recurso | Origen | Uso / licencia en esta entrega |
| --- | --- | --- |
| Cuatro PNG oficiales | propietario, integridad SHA-256 verificada | solo referencia visual; no se incrustan ni redistribuyen en el visor |
| Ilustraciones gastronómicas SVG | generadas mediante código local para esta entrega | placeholders propios de demostración; no son fotografías ni recursos externos |
| Iconos SVG lineales | definidos localmente en `assets/mockups.js` | placeholders propios; no dependen de paquete o CDN |
| Tipografía Inter | candidata documentada | no se distribuye; se usa fallback del sistema hasta aprobar origen/licencia |
| Datos, nombres, mesas e importes | ficticios | exclusivamente para composición visual; no representan operación real |

No se hicieron solicitudes de red ni se incorporaron imágenes, fuentes, librerías o CDN externos.

## Estados y salvaguardas

- `TAB-01` muestra `Sin sesión pública iniciada`; la acción de invitado explica que la sesión depende de confirmación servidor.
- `TAB-03` solo representa una sesión ya confirmada para permitir evaluar el menú.
- KDS usa verbos `Solicitar inicio` y `Solicitar listo`; no mueve tarjetas ni simula transiciones.
- POS declara `Sin movimiento contable todavía`; el CTA avanza a captura de efectivo, no confirma el pago.
- Todos los entornos identifican datos ficticios o de demostración.
- El visor no registra listeners de negocio, solicitudes HTTP de aplicación, almacenamiento ni API.

## Adaptación responsiva

- El índice pasa de tres a dos y una columna según ancho disponible.
- El visor permite inspeccionar especificaciones anchas mediante scroll controlado sin deformar su resolución objetivo.
- La tableta inicia en vertical y permite alternar a horizontal desde un control exclusivo del visor. La variante horizontal también es seleccionable por `?orientation=landscape`.
- La evidencia `TAB-03-horizontal.png` muestra el dispositivo completo y mantiene categorías, cuatro productos y carrito persistente.

## Validaciones ejecutadas

- `node --check design/mockups/phase-0.4/assets/mockups.js`: correcto.
- `node --check scripts/validate-phase-0.4.mjs`: correcto.
- `node scripts/validate-phase-0.4.mjs`: correcto; 6 IDs, títulos, rutas y plataformas canónicos; índice/recursos; tokens; targets táctiles; orientación; salvaguardas; PNG y hashes oficiales.
- `node scripts/validate-phase-0.3.mjs`: se ejecuta en el cierre para comprobar regresión de los 46 wireframes y referencias.
- Renderizado HTTP local: `node scripts/serve-phase-0.4-review.mjs`, ligado a `127.0.0.1:4190`, sin dependencias externas.
- Capturas: siete PNG reales generados con Microsoft Edge Chromium headless contra el servidor local. No son imágenes generadas artificialmente.
- Chrome headless no produjo archivos en el primer intento al integrarse con una sesión interactiva; una prueba adicional desde un contexto distinto obtuvo `ERR_CONNECTION_TIMED_OUT`. No se contabilizaron esos intentos como evidencia. Edge headless escribió y verificó los siete PNG.
- `git status --short`: no disponible porque `C:\Proyectos\Restaurantes` no contiene metadata `.git`; no se afirma estado de control de versiones.
- Paquete de revisión: 20 archivos extraídos correctamente; índice, cinco entornos y `captures/TAB-03-horizontal.png` respondieron HTTP `200` desde el servidor incluido. El SHA-256 se entrega fuera del ZIP para evitar una referencia circular.

## Desviaciones y propuestas pendientes

1. Sustituir las ilustraciones SVG de demostración por fotografía gastronómica propia/licenciada cuando el propietario proporcione el catálogo visual. No existe autorización para descargar imágenes externas.
2. Confirmar archivo y licencia de Inter; hasta entonces se mantiene fallback del sistema.
3. Los valores específicos de los tokens siguen sujetos a validación visual. Esta entrega no modifica ninguno.
4. Confirmar logo y marca configurable del restaurante; `Restaurant OS` sigue siendo identidad provisional.
5. Validar tabletas y móviles físicos, distancia real del KDS, monitor/touch del POS y contraste WCAG 2.2 AA con hardware representativo.
6. Las políticas de descuentos, cancelaciones, cierre de caja, división, reembolsos, liberación de dispositivo y hardware continúan pendientes en `docs/10-PENDIENTES.md`.

Ninguna propuesta de esta lista se considera aprobada por aparecer en los mockups.

## Entrega 2 — inventario de los 40 mockups extendidos

Los seis IDs de la tabla inicial, más los 40 siguientes, constituyen el inventario completo de 46 pantallas. Cada destino nuevo dispone de `normal`, `vacío`, `cargando`, `error`, `sin conexión`, `pendiente de ACK`, `ACK servidor`, `sin permiso`, `validación`, `conflicto` y `cancelación` mediante el selector documental del visor. La captura indicada corresponde al estado normal; los demás estados se renderizan en tiempo real sin ejecutar una operación.

| ID | Pantalla / origen | Plataforma · rol | Fuente de mockup | Tema / referencia | Captura real |
| --- | --- | --- | --- | --- | --- |
| `ADM-01` | Inicio de sesión · `#ADM-01` | React · empleado | `admin/delivery-2.html#ADM-01` | `admin-light` · 01 | `captures/ADM-01.png` |
| `ADM-03` | Mesas y áreas · `#ADM-03` | React · admin/gerencia | `admin/delivery-2.html#ADM-03` | `admin-light` · 01 | `captures/ADM-03.png` |
| `ADM-04` | Mesa y sesión · `#ADM-04` | React · admin/gerencia | `admin/delivery-2.html#ADM-04` | `admin-light` · 01 | `captures/ADM-04.png` |
| `ADM-05` | Pedidos · `#ADM-05` | React · admin/gerencia | `admin/delivery-2.html#ADM-05` | `admin-light` · 01 | `captures/ADM-05.png` |
| `ADM-06` | Menú y productos · `#ADM-06` | React · admin/gerencia | `admin/delivery-2.html#ADM-06` | `admin-light` · 01 | `captures/ADM-06.png` |
| `ADM-07` | Personal · `#ADM-07` | React · admin/gerencia delegada | `admin/delivery-2.html#ADM-07` | `admin-light` · 01 | `captures/ADM-07.png` |
| `ADM-08` | Dispositivos · `#ADM-08` | React · admin/gerencia autorizada | `admin/delivery-2.html#ADM-08` | `admin-light` · 01 | `captures/ADM-08.png` |
| `ADM-09` | Reportes · `#ADM-09` | React · admin/gerencia autorizada | `admin/delivery-2.html#ADM-09` | `admin-light` · 01 | `captures/ADM-09.png` |
| `ADM-10` | Configuración · `#ADM-10` | React · administrador | `admin/delivery-2.html#ADM-10` | `admin-light` · 01 | `captures/ADM-10.png` |
| `TAB-02` | Acceso invitado · `#TAB-02` | Flutter · invitado | `tablet/delivery-2.html#TAB-02` | `customer-warm` · 02 | `captures/TAB-02.png` |
| `TAB-04` | Búsqueda · `#TAB-04` | Flutter · invitado | `tablet/delivery-2.html#TAB-04` | `customer-warm` · 02 | `captures/TAB-04.png` |
| `TAB-05` | Detalle de platillo · `#TAB-05` | Flutter · invitado | `tablet/delivery-2.html#TAB-05` | `customer-warm` · 02 | `captures/TAB-05.png` |
| `TAB-06` | Complementos · `#TAB-06` | Flutter · invitado | `tablet/delivery-2.html#TAB-06` | `customer-warm` · 02 | `captures/TAB-06.png` |
| `TAB-07` | Carrito · `#TAB-07` | Flutter · invitado | `tablet/delivery-2.html#TAB-07` | `customer-warm` · 02 | `captures/TAB-07.png` |
| `TAB-08` | Confirmación pedido · `#TAB-08` | Flutter · invitado | `tablet/delivery-2.html#TAB-08` | `customer-warm` · 02 | `captures/TAB-08.png` |
| `TAB-09` | Seguimiento · `#TAB-09` | Flutter · invitado | `tablet/delivery-2.html#TAB-09` | `customer-warm` · 02 | `captures/TAB-09.png` |
| `TAB-10` | Consumo · `#TAB-10` | Flutter · invitado | `tablet/delivery-2.html#TAB-10` | `customer-warm` · 02 | `captures/TAB-10.png` |
| `TAB-11` | Solicitud de mesero · `#TAB-11` | Flutter · invitado | `tablet/delivery-2.html#TAB-11` | `customer-warm` · 02 | `captures/TAB-11.png` |
| `TAB-12` | Cierre público · `#TAB-12` | Flutter · dispositivo | `tablet/delivery-2.html#TAB-12` | `customer-warm` · 02 | `captures/TAB-12.png` |
| `KDS-02` | Filtro estación · `#KDS-02` | React · cocina | `kds/delivery-2.html#KDS-02` | `kitchen-dark` · 03 | `captures/KDS-02.png` |
| `KDS-03` | Detalle pedido · `#KDS-03` | React · cocina | `kds/delivery-2.html#KDS-03` | `kitchen-dark` · 03 | `captures/KDS-03.png` |
| `KDS-04` | Iniciar preparación · `#KDS-04` | React · cocina autorizada | `kds/delivery-2.html#KDS-04` | `kitchen-dark` · 03 | `captures/KDS-04.png` |
| `KDS-05` | Pedido listo · `#KDS-05` | React · cocina autorizada | `kds/delivery-2.html#KDS-05` | `kitchen-dark` · 03 | `captures/KDS-05.png` |
| `KDS-06` | Historial · `#KDS-06` | React · cocina | `kds/delivery-2.html#KDS-06` | `kitchen-dark` · 03 | `captures/KDS-06.png` |
| `KDS-07` | Recuperación · `#KDS-07` | React · cocina | `kds/delivery-2.html#KDS-07` | `kitchen-dark` · 03 | `captures/KDS-07.png` |
| `POS-01` | Cuentas · `#POS-01` | React · cajero | `pos/delivery-2.html#POS-01` | `pos-light` · 04 | `captures/POS-01.png` |
| `POS-02` | Consumo · `#POS-02` | React · caja autorizada | `pos/delivery-2.html#POS-02` | `pos-light` · 04 | `captures/POS-02.png` |
| `POS-04` | Efectivo · `#POS-04` | React · cajero | `pos/delivery-2.html#POS-04` | `pos-light` · 04 | `captures/POS-04.png` |
| `POS-05` | Propina · `#POS-05` | React · cajero | `pos/delivery-2.html#POS-05` | `pos-light` · 04 | `captures/POS-05.png` |
| `POS-06` | Confirmación pago · `#POS-06` | React · cajero | `pos/delivery-2.html#POS-06` | `pos-light` · 04 | `captures/POS-06.png` |
| `POS-07` | Ticket · `#POS-07` | React · cajero | `pos/delivery-2.html#POS-07` | `pos-light` · 04 | `captures/POS-07.png` |
| `POS-08` | Apertura · `#POS-08` | React · cajero | `pos/delivery-2.html#POS-08` | `pos-light` · 04 | `captures/POS-08.png` |
| `POS-09` | Cierre/arqueo · `#POS-09` | React · caja autorizada | `pos/delivery-2.html#POS-09` | `pos-light` · 04 | `captures/POS-09.png` |
| `POS-10` | Pendientes · `#POS-10` | React · cajero | `pos/delivery-2.html#POS-10` | `pos-light` · 04 | `captures/POS-10.png` |
| `WAI-01` | Acceso empleado · `#WAI-01` | Flutter · mesero | `waiter/delivery-2.html#WAI-01` | `customer-warm` · sistema | `captures/WAI-01.png` |
| `WAI-03` | Detalle mesa · `#WAI-03` | Flutter · mesero | `waiter/delivery-2.html#WAI-03` | `customer-warm` · sistema | `captures/WAI-03.png` |
| `WAI-04` | Registro pedido · `#WAI-04` | Flutter · mesero | `waiter/delivery-2.html#WAI-04` | `customer-warm` · sistema | `captures/WAI-04.png` |
| `WAI-05` | Seguimiento · `#WAI-05` | Flutter · mesero | `waiter/delivery-2.html#WAI-05` | `customer-warm` · sistema | `captures/WAI-05.png` |
| `WAI-06` | Solicitudes · `#WAI-06` | Flutter · mesero | `waiter/delivery-2.html#WAI-06` | `customer-warm` · sistema | `captures/WAI-06.png` |
| `WAI-07` | Entrega · `#WAI-07` | Flutter · mesero | `waiter/delivery-2.html#WAI-07` | `customer-warm` · sistema | `captures/WAI-07.png` |

Los componentes reutilizados son: barra superior administrativa, tarjetas, tablas, campos, chips semánticos, botones; dispositivo vertical, categorías, tarjetas gastronómicas, stepper y resumen persistente; toolbar/tickets KDS; rail y panel contextual POS; shell móvil y navegación inferior de meseros. Todos consumen `tokens.css`, que continúa siendo una traducción validada de los siete JSON canónicos.

## Validación de la Entrega 2

- `node --check design/mockups/phase-0.4/assets/delivery-2.js`, `node --check design/mockups/phase-0.4/assets/index-delivery-2.js` y `node --check scripts/validate-phase-0.4-delivery-2.mjs`: correctos.
- `node scripts/validate-phase-0.4-delivery-2.mjs`: correcto; 46/46 IDs, títulos y rutas; 40 nuevos + 6 aprobados; 47 PNG; cuatro temas; siete tokens; recursos locales; estados ACK; KDS sin conexión; resumen POS contextual; referencias oficiales.
- `node scripts/validate-phase-0.3.mjs` y `node scripts/validate-scaffold.mjs`: correctos como regresión de wireframes, tokens y estructura.
- Los ocho archivos fuente y las siete capturas de los seis mockups aprobados se verificaron contra sus 15 SHA-256 congelados: sin cambios.
- Las 40 capturas nuevas se generaron con Microsoft Edge Chromium headless contra `127.0.0.1:4191`; no son imágenes generadas artificialmente.
- La portada `index.html` carga `index-delivery-2.js` y enlaza los 46 destinos, conservando los seis enlaces a los archivos originales aprobados.
- Los placeholders gastronómicos nuevos están dibujados en CSS, sin fotografías, CDN, fuentes ni solicitudes externas.
- Prueba HTTP: una primera ejecución dentro del sandbox no pudo acceder a loopback; la repetición con permiso local validó 17 recursos en `200` y una ruta ausente en `404`. La prueba volvió a pasar desde la extracción independiente.
- Auditoría del paquete: el primer ZIP se rechazó porque omitía el segmento `phase-0.4` en la ruta interna del visor. Se eliminó, se regeneró y se extrajo de nuevo: 86 archivos, 47 capturas, cero rutas excluidas, validador correcto y servidor HTTP correcto. El SHA-256 se entrega de forma externa.

## Punto de control

La Entrega 1 fue aprobada expresamente por el propietario. La Entrega 2 está técnicamente completa y permanece **pendiente de aprobación visual**. No iniciar prototipo interactivo de Fase 0.5 ni convertir estos artefactos en pantallas funcionales hasta recibir aprobación expresa.
