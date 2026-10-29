# Restaurant OS — revisión de Fase 0.4, Entrega 2

## Contenido

Este paquete contiene el visor estático completo de los 46 mockups de Fase 0.4, sus 47 capturas PNG (una por pantalla y la variante horizontal aprobada de `TAB-03`), el inventario documental y el servidor HTTP local. Los seis mockups de Entrega 1 están aprobados y se incluyen sin cambios; los 40 restantes están pendientes de aprobación visual.

No contiene aplicaciones productivas, backend, dependencias instaladas, cachés, perfiles de navegador, secretos ni integraciones.

## Abrir el visor

Requiere Node.js instalado. Desde la raíz extraída del paquete:

```powershell
node scripts/serve-phase-0.4-review.mjs
```

Abrir `http://127.0.0.1:4190/` en un navegador moderno. El índice agrupa las 46 pantallas por Administración, Tableta, KDS, POS y Meseros.

No se recomienda abrir el HTML con doble clic: el servidor local evita diferencias de seguridad entre navegadores y permite comprobar todas las rutas de forma reproducible. El visor no solicita servicios externos.

## Convenciones de revisión

- Verde en el índice: mockup de Entrega 1 ya aprobado.
- Resto: mockup nuevo de Entrega 2, pendiente de aprobación visual.
- El selector superior de cada mockup nuevo presenta 11 estados UX documentales. No ejecuta lógica de negocio.
- `Pendiente ACK` nunca representa una operación confirmada.
- `ACK servidor` es una muestra visual explícitamente etiquetada, no una respuesta real.
- Fotografías pendientes se representan con placeholders CSS propios. No se descargaron ni distribuyeron recursos externos.

## Validar el paquete en el repositorio

```powershell
node --check design/mockups/phase-0.4/assets/delivery-2.js
node --check design/mockups/phase-0.4/assets/index-delivery-2.js
node scripts/validate-phase-0.4-delivery-2.mjs
```

El validador comprueba 46 IDs/títulos/rutas, recursos locales, JavaScript, cuatro temas, siete tokens, 47 PNG, estados críticos, objetivos táctiles, 15 hashes congelados de la Entrega 1 y los cuatro SHA-256 oficiales.

## Alcance

La revisión termina en Fase 0.4, Entrega 2. No inicia Fase 0.5, no contiene prototipo funcional y no aprueba automáticamente los 40 mockups nuevos.
