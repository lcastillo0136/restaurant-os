# FUENTE DE VERDAD — Restaurant OS v1.0

**Estatus:** APROBADA por el propietario del proyecto el 28-10-2026. Documento rector para Codex; si hay contradicción, gana este documento y posteriormente los ADR aprobados.

## Producto y restricciones innegociables
- Sistema integral para operación **real** de restaurante en México.
- **Local-first**: servidor y BD en LAN; operación normal sin internet. No se exige conexión cloud para pedidos, cocina, caja efectivo ni tickets.
- Una sucursal al inicio; modelo de organizaciones/sucursales para crecer; sincronización entre sucursales es posterior.
- Administrador web, tablets fijas de mesa, pantalla de cocina, caja/POS, usuarios/empleados/turnos, horarios, productos, propinas, clientes invitados y registrados, favoritos, NFC/QR, pasarela de pagos, tickets, CFDI.
- MVP: configuración, permisos, empleados/turnos básicos, salón/mesas, menú, pedidos tablet, cocina, cobro efectivo, caja, tickets, propinas básicas, reportes mínimos, seguridad, backups, pruebas campo.
- Futuro: clientes/favoritos persistentes, NFC/QR, terminales electrónicas, CFDI y analítica ampliada (se diseñan interfaces desde ahora, no se implementan antes del MVP).

## Decisión de plataformas — ACTUALIZACIÓN
- **Flutter + Dart** para **toda app móvil/tableta**, comenzando por `table_kiosk` Android. Incluye futuras apps de meseros y cocina en tableta. Android nativo/plugin o platform channel cuando se necesite NFC, QR, modo kiosco o periféricos; verificar hardware.
- **React + TypeScript** para escritorio web: administración y POS; KDS web si monitor de cocina lo requiere.
- **NestJS + TypeScript**, PostgreSQL, Prisma; API REST/WebSocket. En Fase 1.1 el desarrollo local oficial es nativo en Windows; Docker Compose se conserva como alternativa no obligatoria. El proxy HTTPS LAN se decide antes de exponer servicios fuera de loopback.
- Reutilizar **tokens semánticos y contratos**, no widgets entre React y Flutter.

## Decisión visual UX/UI v1.0 — APROBADA 100%
- **Fase 0 de diseño formal y obligatoria antes del desarrollo de interfaces productivas.**
- 0.1 Identidad visual; 0.2 arquitectura UX; 0.3 wireframes; 0.4 mockups; 0.5 prototipo interactivo; 0.6 tokens y componentes compartidos; 0.7 pruebas/validación.
- Estilo moderno, profesional, minimalista, funcional, consistente.
- Administración clara/neutral; mesa cálida gastronómica con marca configurable; cocina oscura de alto contraste; caja neutral de alto contraste.
- Fuente Inter; iconos Lucide (validar licencias/importación Flutter), WCAG 2.2 AA, blancos táctiles >=48dp; estados no dependen solo del color.
- Primero diseñar **gestión de mesas** y **pantalla de pedidos de tableta**.
- Las cuatro imágenes en `design/reference/01-admin-aprobado.png`, `02-tablet-aprobado.png`, `03-kds-aprobado.png` y `04-pos-aprobado.png` son la **fuente de verdad visual oficial** proporcionada por el propietario. No sobrescribirlas, sustituirlas ni usar reconstrucciones anteriores como referencia de diseño.
- Los SHA-256 originales fueron suministrados por el propietario y coinciden con los cuatro archivos locales; el inventario verificable se conserva en `docs/design/REFERENCIAS-VISUALES.md`.
- Administración usa navegación principal horizontal superior; no implementar un sidebar permanente como navegación principal. POS conserva navegación lateral compacta según su referencia oficial.
- Las familias `admin-light`, `customer-warm`, `kitchen-dark` y `pos-light` están aprobadas como dirección estética. Los valores específicos de los tokens permanecen sujetos a validación visual de pantallas.

## Seguridad y operación
- Sesiones de clientes separadas de sesiones comerciales y del vínculo mesa-dispositivo.
- Un solo consumo activo por mesa; pedidos con clave de idempotencia; items con precio snapshot; no borrar rastros de auditoría.
- Caja: turnos, arqueos, pagos parciales, propina voluntaria separada; moneda MXN, aritmética decimal.
- Offline internet: sí. Offline servidor: no confirmar operaciones. Backups y UPS recomendados para producción.
- Facturación CFDI: no emitir sin timbrado PAC/validación fiscal; cola local con reintentos protegidos contra duplicados.

## Política de cambios
- Etiquetas: APROBADO / PROPUESTO / PENDIENTE / POSPUESTO.
- Cambios sustantivos exigen ADR, revisión de impacto, aprobación explícita y actualización de docs/tokens/tests.
