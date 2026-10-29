# Referencias visuales — análisis de Fase 0.1

**Estado:** fuente de verdad visual oficial declarada por el propietario el 29-10-2026; SHA-256 originales verificados. Los valores concretos de tokens siguen sujetos a validación visual.

## Alcance y fuente

Se inspeccionaron los cuatro PNG en `design/reference/`. Son las imágenes originales proporcionadas por el propietario y constituyen la fuente de verdad visual oficial. No se sobrescribieron durante esta validación. Su uso como referencia no autoriza reutilizar sus marcas, personas, textos, precios, fotografías o métricas como contenido productivo.

Los temas de `design/tokens/` están aprobados como familias semánticas. Sus valores específicos permanecen sujetos a validación visual de las pantallas.

## Inventario local verificable

| Archivo | Dimensiones | SHA-256 local |
| --- | --- | --- |
| `01-admin-aprobado.png` | 2048 × 1536 | `B816382C0CFEA84469885EA017C6ADE6B7B161A6C831E9DFC4266E7DC6BB54C3` |
| `02-tablet-aprobado.png` | 1706 × 888 | `36A87F4E58F83AEA107278C431DC46F989A8C9CCA772378591674644E5C357E7` |
| `03-kds-aprobado.png` | 1536 × 1024 | `076CD7B14599C003C9AFB5521A1DBF0DE5CDFC7505E7AF1D09787075F9196FDD` |
| `04-pos-aprobado.png` | 1024 × 769 | `0D326B5789506961793FAA867B0138439EB26ADE6CDDFB69B426F038351A3C0E` |

Los cuatro SHA-256 locales coinciden exactamente con los valores originales suministrados por el propietario el 29-10-2026. La procedencia binaria queda verificada; no se modificaron los archivos.

## 01 — Administración

Archivo: `design/reference/01-admin-aprobado.png`.

- Lienzo desktop claro con fondo gris neutro y una gran superficie principal de esquinas muy redondeadas.
- Navegación compacta horizontal: marca a la izquierda, pestaña activa oscura en forma de píldora, iconos circulares y metadatos de sesión a la derecha. Este es el patrón principal aprobado; no implementar sidebar permanente para administración.
- Jerarquía: título amplio, filtros compactos, indicadores KPI sin saturar y tablero de tarjetas blancas amplias.
- El naranja funciona como acento selectivo en gráficos y estados; no como fondo dominante.
- Aplicación: `admin-light`, iconos Lucide, tablas y datos reales solo en fases posteriores. No se copiarán las cifras, ciudades, avatar, fecha, logotipo ni el nombre de la imagen.

## 02 — Tableta de mesa

Archivo: `design/reference/02-tablet-aprobado.png`.

- La imagen representa un kiosco físico integrado en una escena de restaurante; no es una captura plana de una app. El producto debe funcionar sin depender de ese modelo de pedestal, foto de fondo ni lector mostrado.
- Dentro del dispositivo: superficie blanca/cálida, encabezado de bienvenida, búsqueda, categorías con iconos, tarjetas de alimento fotográficas, CTA de alto contraste y cambio de idioma.
- La jerarquía favorece exploración rápida y acciones grandes, con fotografías gastronómicas como apoyo de catálogo autorizado.
- Aplicación: `customer-warm`, Flutter Android, targets de al menos 48 dp, sesión de mesa y NFC/QR solo como punto de extensión posterior. La Fase 0.1 muestra únicamente una pantalla de identidad estática.

## 03 — Cocina / KDS

Archivo: `design/reference/03-kds-aprobado.png`.

- Pantalla horizontal oscura, barra operativa densa y tres columnas de estado sobre alto contraste.
- Tarjetas claras y grandes: identificador de orden, tiempo, productos, estación y acciones de gran tamaño. Los contadores de columna complementan, no sustituyen, nombres de estado.
- El azul/verde/naranja diferencian acción o prioridad, pero texto, posición e icono también deben expresar el estado.
- Aplicación: `kitchen-dark`, React para monitor en MVP. Estados en español y flujo real se implementarán después de la validación de UX; no se copian órdenes ni marcas de la referencia.

## 04 — POS

Archivo: `design/reference/04-pos-aprobado.png`.

- Interfaz clara con navegación lateral estrecha, área principal dedicada a elección de pago y panel persistente de resumen a la derecha.
- Las opciones se presentan como tarjetas con estado de selección explícito y CTA inferior separado de acciones de anulación.
- El panel de cuenta conserva productos, cantidades y totales en una zona estable de lectura.
- Aplicación: `pos-light`, React escritorio con navegación lateral compacta. Solo efectivo será alcance MVP cuando llegue su fase; moneda, descuentos, persona, impuestos, precios y tarjetas de la imagen no son datos reutilizables.

## Accesibilidad común

- Contraste WCAG 2.2 AA a verificar con los valores finales y tamaños reales.
- Foco visible, texto y/o icono para todo estado; no depender exclusivamente del color.
- Objetivos táctiles mínimos de 48 dp en tableta, KDS táctil y POS táctil.
- Respetar reducción de movimiento; la cocina no debe requerir animación para interpretar el estado.

## Verificación de procedencia cerrada

La presencia, dimensiones, nombres y SHA-256 de los cuatro PNG fueron verificados contra los hashes originales suministrados por el propietario. No existe bloqueo de procedencia de referencias visuales.
