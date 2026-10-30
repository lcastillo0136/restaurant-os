# Revisión independiente — Fase 1.1

## Alcance a revisar

1. `infra/docker-compose.dev.yml` contiene sólo API NestJS y PostgreSQL, red interna, healthchecks, reinicio y volumen `postgres_data`.
2. `.env.example` contiene placeholders locales, no secretos, y `.gitignore` excluye `.env`, datos persistentes, claves, builds y referencias visuales privadas.
3. `apps/api` sólo tiene health/status técnicos, validación de entorno y pruebas; no hay modelo, migración, autenticación ni endpoint comercial.
4. `scripts/ops` no usa `down -v`, no borra PostgreSQL y la limpieza se limita a `.tmp\phase-1.1`.
5. `.github/workflows/validation.yml` usa permisos mínimos, se limita a PR/push sobre `Master` y no despliega, publica ni carga artefactos.

## Reproducción

En un clon público sin referencias privadas:

```powershell
pnpm install --frozen-lockfile
node scripts/audit-public-baseline.mjs
pnpm validate:design:public
pnpm validate:infra
pnpm test:web
pnpm build:web
pnpm test:api
pnpm audit:production
```

Para Flutter:

```powershell
Set-Location apps/table_kiosk
flutter pub get
flutter analyze
flutter test
```

Para aceptar Compose en un equipo con Docker:

```powershell
./scripts/ops/Initialize-RestaurantEnvironment.ps1
# Definir POSTGRES_PASSWORD en .env sin versionarlo.
./scripts/ops/Test-RestaurantCompose.ps1
./scripts/ops/Stop-RestaurantServices.ps1
./scripts/ops/Start-RestaurantServices.ps1
./scripts/ops/Get-RestaurantServiceStatus.ps1
```

Después de la parada/inicio, verificar que PostgreSQL conserva su volumen mediante el servicio ya existente; no crear tablas ni datos de negocio para esta fase. Registrar el resultado, incluido si la prueba sin WAN se realizó, antes de aprobar formalmente.

Consulta [EVIDENCIAS-FASE-1.1.md](EVIDENCIAS-FASE-1.1.md) para los resultados reales de esta entrega.
