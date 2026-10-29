# Diseño UX/UI — referencia obligatoria

## 4 entornos
1. Administración desktop: claro neutral, **navegación superior horizontal**, dashboard y plano/tabla de mesas. No usar sidebar permanente como navegación principal.
2. Mesa Android Flutter: cálido, marca restaurante configurable, tipografía legible, menú foto + categorías, carrito prominente, invitado rápido, confirmación explícita.
3. KDS cocina: tema oscuro, tarjetas grandes, contraste alto, estaciones y estados, cronómetro, controles 48dp+.
4. POS caja: claro y rápido, izquierda mesas/cuentas, derecha consumo/pagos, confirmación distinta de anulación.

## Tokens (ver design/tokens/)
Colores semánticos por tema; fuentes Inter con fallback y licencias verificadas; iconografía Lucide con equivalente Flutter aprobado; base spacing 4; radius 8/12/16; target mínimo 48 dp; WCAG AA.

## Navegación aprobada
Admin: Dashboard/Mesas/Pedidos/Menú/Personal/Cajas/Reportes/Ajustes.
Mesa: bienvenida -> invitado/login futuro -> menú -> detalle producto -> carrito -> confirmación -> estado/cuenta -> solicitud atención -> reinicio al cerrar visita.
Cocina: nuevos -> preparando -> listos; mesa, prioridad, estación y notas alérgenos.
Caja: mesas/cuentas -> detalle -> pagos divididos -> propina -> confirmar -> ticket -> cierre.

## Entregables Fase 0
0.1 Identidad, 0.2 mapa de flujos, 0.3 wireframes, 0.4 mockups completos, 0.5 prototipo, 0.6 paquetes tokens/components Flutter+React, 0.7 validación táctil/accesibilidad.

## Arquitectura UX de Fase 0.2

La navegación, mapa de pantallas, flujos, estados, roles y operaciones críticas se documentan en `docs/design/`. Son contratos para los wireframes de Fase 0.3, no pantallas implementadas ni reglas comerciales aprobadas.

## Material visual
Las cuatro imágenes de `design/reference/` son la fuente de verdad visual oficial. Los SVG de `design/svg/` son artefactos históricos no autoritativos y no deben guiar decisiones visuales ni sustituir los PNG oficiales.
