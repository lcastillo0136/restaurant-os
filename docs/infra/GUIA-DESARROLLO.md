# Guía de desarrollo local

## Requisitos

- Git, Node.js `24.20.0`, PNPM `11.25.0` y Flutter `3.47.7` para la tableta.
- Docker Desktop con Docker Compose para ejecutar los servicios de contenedor. No instalarlo, cambiar virtualización ni solicitar privilegios administrativos como parte de estos scripts.
- Copia local de las cuatro referencias visuales internas sólo para validaciones locales; nunca se publica ni se incluye en el ZIP de revisión.

Comprueba los requisitos sin modificar el sistema:

```powershell
./scripts/ops/Test-RestaurantRequirements.ps1 -IncludeFlutter
./scripts/ops/Test-RestaurantRequirements.ps1 -RequireDocker
```

## Preparación

```powershell
./scripts/ops/Initialize-RestaurantEnvironment.ps1
```

El script crea `.env` sólo si no existe, por lo que no sobrescribe configuraciones locales. Edita después `POSTGRES_PASSWORD`; el placeholder de `.env.example` no permite iniciar Compose.

## Iniciar y consultar contenedores

```powershell
./scripts/ops/Start-RestaurantServices.ps1
./scripts/ops/Get-RestaurantServiceStatus.ps1
```

La API técnica queda en `http://127.0.0.1:3000/api/v1/system/health` con el puerto definido por `API_PORT`; PostgreSQL queda en `127.0.0.1:5433` con el puerto definido por `POSTGRES_PORT`. Si se cambia el puerto API, sustituye `3000` en la URL. PostgreSQL no contiene tablas ni datos de negocio.

Para una prueba completa de Compose (configuración, arranque, health API y `pg_isready`), ejecuta:

```powershell
./scripts/ops/Test-RestaurantCompose.ps1
```

## Ejecutar aplicaciones sin Docker

```powershell
pnpm dev:api
pnpm dev:admin
pnpm dev:kitchen
pnpm dev:pos
pnpm dev:table-kiosk
```

Los tres comandos web conservan sus puertos de Vite y no realizan integración con la API. `dev:table-kiosk` requiere un emulador o Android físico seleccionado por Flutter; no transforma la tableta Android en una web app.

## Validar y compilar

```powershell
pnpm validate:infra
pnpm test:web
pnpm build:web
pnpm build:api
pnpm test:api
./scripts/ops/Invoke-RestaurantValidation.ps1 -IncludeFlutter
```

`pnpm check` reúne los validadores locales de Fase 0, infraestructura, pruebas React, builds web, pruebas API y auditoría de dependencias de producción. La modalidad `pnpm validate:design:public` está reservada para clonaciones redistribuibles/CI: comprueba que las referencias PNG internas estén ausentes.

## Detener y limpiar

```powershell
./scripts/ops/Stop-RestaurantServices.ps1
./scripts/ops/Clear-RestaurantTemporaryFiles.ps1
```

La parada usa `docker compose stop`; el volumen `postgres_data` permanece intacto. La limpieza sólo afecta `C:\Proyectos\Restaurantes\.tmp\phase-1.1` si existe, y nunca borra volúmenes, `.env`, builds o datos de PostgreSQL.

## Diagnóstico

- **Docker no encontrado:** instala/activa Docker sólo con autorización independiente; mientras tanto usa `pnpm validate:infra` y las pruebas no Docker. No afirmar que Compose fue probado.
- **`POSTGRES_PASSWORD` faltante:** define un valor local secreto en `.env`; Compose lo exige antes de crear servicios.
- **API no inicia:** revisa el mensaje de validación de `API_HOST`, `API_PORT`, `API_EXECUTION_MODE` u orígenes CORS. Nunca poner secretos en el mensaje ni en Git.
- **Puerto ocupado:** asigna otro `API_PORT` o `POSTGRES_PORT` local y vuelve a ejecutar el inicio. No expongas un puerto a todas las interfaces para resolverlo.
- **Flutter sin dispositivo:** `flutter analyze` y `flutter test` siguen siendo aplicables; una ejecución de UI Android exige emulador/dispositivo aprobado.
