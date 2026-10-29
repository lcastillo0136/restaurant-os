# Inicialización asistida en Codex — instrucciones, no pasos ya ejecutados

## Requisitos
Flutter SDK Android, Android SDK/ADB, Node.js LTS compatible con NestJS/Prisma, pnpm, Docker Compose, Git; `flutter doctor` sin bloqueos; versiones en lockfiles.

## En Codex
1. Crear workspace monorepo pnpm `apps/api`, `apps/admin_web`, `apps/pos_web`, `apps/kitchen_web` y `packages/contracts`, `packages/web_ui`, `packages/design_tokens`.
2. `flutter create --platforms=android apps/table_kiosk` (si Flutter lo acepta en el workspace; si no, inicializar en ruta temporal y mover). Separar código con MVVM. Crear tema desde tokens.
3. Crear `apps/api` NestJS y Prisma + migraciones para organization, branch, user, role y audit. Verificar versionado actual contra docs oficiales.
4. Docker Compose para PostgreSQL solo desarrollo: `docker compose -f infra/docker-compose.dev.yml up -d`; configurar contraseña local vía `.env` no versionado.
5. `apps/admin_web` React/Vite con login y sucursal inicial sin datos ficticios en producción. Establecer CORS/HTTPS de desarrollo y contratos.
6. Tests unitarios y smoke. Registrar resultados reales en `docs/STATUS.md`.

## Nota
Este paquete entrega especificaciones, mockups y tema base, no una aplicación operativa construida. Codex debe generar/scaffold proyectos reales y ejecutar verificaciones.
