# Guía de desarrollo local

## Requisitos

- Git, Node.js `24.20.0`, PNPM `11.25.0` y Flutter `3.47.7` para la tableta.
- PostgreSQL 17 para el modo nativo oficial. Instalarlo sólo con autorización específica para el instalador elevado; el servidor debe quedar limitado a `127.0.0.1:5432`.
- Docker Desktop y WSL 2 no se instalan para Fase 1.1. Docker Compose se conserva como alternativa futura y sus scripts permanecen separados.
- Copia local de las cuatro referencias visuales internas sólo para validaciones locales; nunca se publica ni se incluye en el ZIP de revisión.

Comprueba los requisitos sin modificar el sistema:

```powershell
./scripts/ops/Test-RestaurantRequirements.ps1 -IncludeFlutter
./scripts/ops/Test-RestaurantNativeRequirements.ps1
./scripts/ops/Test-RestaurantNativeRequirements.ps1 -RequirePostgreSql
```

## Modo A — Desarrollo nativo Windows

```powershell
pnpm install --frozen-lockfile
./scripts/ops/Test-RestaurantNativeRequirements.ps1 -IncludeFlutter
```

La API tiene valores seguros por defecto (`127.0.0.1:3000`, modo `development`, CORS vacío). No guardar contraseñas de PostgreSQL en archivos versionados; los scripts técnicos la solicitan como valor seguro sólo durante su ejecución.

### PostgreSQL nativo

```powershell
./scripts/ops/Get-RestaurantNativeStatus.ps1
./scripts/ops/Test-RestaurantNativePostgreSql.ps1
```

Si la inspección confirma que PostgreSQL no escucha exactamente en `127.0.0.1`, un administrador puede aplicar el cambio deliberado y reiniciar únicamente ese servicio:

```powershell
./scripts/ops/Set-RestaurantNativePostgreSqlLoopback.ps1
```

Para verificar reinicio y persistencia sin objetos de negocio:

```powershell
./scripts/ops/Test-RestaurantNativePostgreSql.ps1 -VerifyPersistence
```

El script aborta si ya existe el esquema técnico temporal y sólo lo elimina después de una verificación exitosa. El reinicio requiere privilegios para el servicio PostgreSQL.

### API y aplicaciones React

```powershell
./scripts/ops/Start-RestaurantNativeApi.ps1
./scripts/ops/Start-RestaurantNativeWeb.ps1 -Application admin
./scripts/ops/Start-RestaurantNativeWeb.ps1 -Application kitchen
./scripts/ops/Start-RestaurantNativeWeb.ps1 -Application pos
./scripts/ops/Get-RestaurantNativeStatus.ps1
```

La API técnica queda en `http://127.0.0.1:3000/api/v1/system/health`. Las aplicaciones web quedan en los puertos fijos `5173` (Administración), `5174` (KDS) y `5175` (POS); no se integran todavía con la API.

## Modo B — Docker Compose (alternativo)

```powershell
./scripts/ops/Initialize-RestaurantEnvironment.ps1
./scripts/ops/Test-RestaurantCompose.ps1
```

No ejecutar este modo para cerrar Fase 1.1. Requiere Docker Desktop autorizado por separado; los scripts Docker no se eliminaron ni mezclan procesos con el modo nativo.

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
./scripts/ops/Stop-RestaurantNativeProcesses.ps1
./scripts/ops/Clear-RestaurantTemporaryFiles.ps1
```

La parada sólo actúa sobre PID y hora de inicio registrados por los scripts nativos; no detiene servicios ajenos. La limpieza sólo afecta `C:\Proyectos\Restaurantes\.tmp\phase-1.1` si existe, y nunca borra volúmenes, `.env`, builds o datos de PostgreSQL.

## Diagnóstico

- **PostgreSQL no encontrado:** solicita autorización específica antes de ejecutar el instalador oficial elevado. No declarar superadas pruebas de servicio, persistencia o exposición hasta instalarlo y ejecutarlas.
- **PostgreSQL escucha fuera de loopback:** no abrir firewall ni interfaces. Ejecutar el script de configuración sólo con privilegios aprobados y verificar de nuevo.
- **Docker no encontrado:** es esperado para el modo oficial actual. No afirmar que Compose fue probado.
- **API no inicia:** revisa el mensaje de validación de `API_HOST`, `API_PORT`, `API_EXECUTION_MODE` u orígenes CORS. Nunca poner secretos en el mensaje ni en Git.
- **Puerto ocupado:** asigna otro `API_PORT` o `POSTGRES_PORT` local y vuelve a ejecutar el inicio. No expongas un puerto a todas las interfaces para resolverlo.
- **Flutter sin dispositivo:** `flutter analyze` y `flutter test` siguen siendo aplicables; una ejecución de UI Android exige emulador/dispositivo aprobado.
