# Sistema de diseño — Fase 0.1

**Estado:** familias de tema aprobadas; valores específicos pendientes de validación visual.

## Temas semánticos

| Entorno | Tema | Intención |
| --- | --- | --- |
| Administración web | `admin-light` | neutro, claro y enfocado en información |
| Tableta de mesa Flutter | `customer-warm` | cálido, hospitalario y táctil |
| KDS web | `kitchen-dark` | alto contraste y legibilidad a distancia |
| POS web | `pos-light` | claro, preciso y de alta concentración |

Cada tema declara `background`, `surface`, `surface-elevated`, `text-primary`, `text-secondary`, `border`, `accent`, `success`, `warning`, `danger` y `disabled` en `design/tokens/colors.json`. No se deben introducir colores, elevaciones, radios o espaciados literales fuera de los tokens sin propuesta y revisión.

## Foundations

- Tipografía candidata: Inter, con fallback de sistema hasta confirmar fuente y licencia.
- Escala de espacio: base 4, con valores 4–48.
- Radio: 8 / 12 / 16 / 20, más píldora para controles compactos.
- Elevación: dos niveles ligeros; la jerarquía parte del espaciado y el contraste, no de sombras intensas.
- Interacción: control táctil de al menos 48 dp, foco visible de 3 px y no dependencia exclusiva de color.
- Movimiento: solo transiciones cortas no esenciales; debe respetarse la reducción de movimiento.

## Paridad de implementación

- React consume variables CSS de `packages/web_design_tokens/styles.css` y Lucide cuando una interfaz web lo requiera.
- Flutter consume `packages/flutter_design_system/lib/restaurant_theme.dart`. Es una traducción semántica, no una importación de CSS o widgets web.
- `design/tokens/` es la única fuente de valores. `design/tokens.json` es un manifiesto de compatibilidad sin valores duplicados.

## Fuera de alcance

No se incluyen logotipo definitivo, fotos de menú, componentes productivos, navegación, wireframes, prototipos ni datos de negocio. Esos temas pertenecen a etapas posteriores de Fase 0.
