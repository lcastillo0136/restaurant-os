# Arquitectura técnica aprobada

## Topología
`Flutter tablets/React web -> Wi-Fi/VLAN LAN -> Caddy HTTPS -> NestJS REST+Socket.IO -> PostgreSQL/files`.
Impresoras térmicas por gateway controlado de impresión LAN. Las tabletas no conectan directamente a PostgreSQL. Integraciones PAC/pagos por adaptadores separados y solo bajo internet disponible.

## Monolito modular
Dominios NestJS: identity, organization, employees, shifts, tables, table-sessions, menu, orders, kitchen, payments, cash-register, tips, receipts, audit, devices, reports; después customers, credentials, payment-providers, invoicing.

## Flutter
`apps/table_kiosk/` primer cliente móvil/tableta: features por dominio; views -> viewmodels -> repositories -> services; estado explícito y testable; sesión de dispositivo en secure storage; cache de menú sin prometer persistencia de pedido; reconexión y recuperación de estado desde API. Shared Flutter package `packages/flutter_design_system/` con ThemeData/componentes. Compatibilidad Android prioritaria; plataforma web no sustituye Android en tableta.

## React
`apps/admin_web`, `apps/pos_web`, opcional `apps/kitchen_web`. Tokens traducidos a variables CSS; API contracts compartidos vía OpenAPI/DTO, generación cliente Dart desde esquema versionado. Si cocina usa Android tablet, `apps/kitchen_tablet` Flutter posterior.

## Lógica clave
UUID; branch_id; UTC persisted + zona horaria por sucursal; decimal exacto; migraciones versionadas; índices y unicidad; soft status y audit inmutable; idempotency keys en POST órdenes/pagos; optimistic concurrency/versiones para mesa/sesión; outbox events tras commit.

## Conectividad
- Sin WAN: órdenes, efectivo, tickets LAN siguen operativos.
- Sin Wi-Fi de tableta: catálogo cacheado solo visual, carrito local **no confirmado**; sincronizar estado al reconectar.
- Sin servidor: suspender transacciones y activar contingencia manual.
- NFC/QR no opera sin sesión autorizada del servidor.

## MVP de seguridad
TLS LAN con certificados confiables; RBAC por sucursal; hash Argon2id; tokens de dispositivo distintos a empleados; caducidad de sesiones; logs sin PII; auditoría de anulaciones; secrets en entorno no versionados; restauración verificable.
