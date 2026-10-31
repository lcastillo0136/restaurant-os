# Evidencias de Fase 1.1

Fecha de ejecución: 2026-10-30. Rama: `feature/phase-1-foundation`. Árbol inicial: limpio.

## Comandos ejecutados y resultados

| Comando | Resultado real |
| --- | --- |
| `pnpm install --frozen-lockfile` | Correcto; workspace de 9 proyectos ya estaba actualizado, sin cambios al lockfile. |
| `Test-RestaurantRequirements.ps1 -IncludeFlutter` | Correcto: Git disponible, Node `24.20.0`, PNPM `11.25.0` y Flutter estable `3.47.7`. |
| `pnpm validate:design` | Correcto; validadores locales de Fase 0.1, 0.3–0.7.1 y hashes de las cuatro referencias internas correctos. |
| Copia temporal sin `design/reference/*.png` + validadores `--review-package` | Correcto; Fases 0.1, 0.3–0.7.1 y Fase 1.1 pasaron sin imágenes privadas. La copia se eliminó con `Clear-RestaurantTemporaryFiles.ps1`. |
| `pnpm validate:infra` | Correcto; Compose, Dockerfile, `.env.example`, scripts y workflow coherentes de forma estática. |
| `pnpm test:web` | Correcto fuera del sandbox: TypeScript, ESLint y Vitest; 1 archivo y 12 pruebas superadas. |
| `pnpm build:web` | Correcto; builds de Administración, KDS y POS completados. |
| `pnpm --filter @restaurant-os/api typecheck` | Correcto. |
| `pnpm test:api` | Correcto fuera del sandbox: 5 pruebas superadas, incluidas validación negativa de configuración y health HTTP/CORS en loopback. |
| `flutter --no-version-check pub get`, `analyze`, `test` en `apps/table_kiosk` | Correcto: sin incidencias de análisis y 1 prueba superada. Se notificaron 4 versiones más nuevas incompatibles con los rangos actuales; no se actualizaron dependencias. |
| `pnpm audit --prod --audit-level high` | Correcto: `No known vulnerabilities found`. |
| `pnpm check` | Correcto fuera del sandbox; reúne las comprobaciones locales anteriores y la auditoría de producción. |
| Análisis sintáctico de los 16 scripts PowerShell | Correcto. |
| `pnpm validate:infra` tras añadir modo nativo | Correcto; Compose alternativo, scripts nativos, puertos Vite loopback y CI coherentes estáticamente. |
| Arranque nativo temporal | Correcto: NestJS respondió `200` en `127.0.0.1:3010/api/v1/system/health`; Administración, KDS y POS respondieron `200` en `127.0.0.1:5173`, `5174` y `5175`. |
| Parada nativa temporal | Correcto: se detuvieron exclusivamente los cuatro listeners registrados por los scripts y los puertos quedaron sin escucha. |
| `Invoke-RestaurantValidation.ps1 -IncludeFlutter` posterior al modo nativo | Correcto: validadores Fase 0 y 1.1, React (12 pruebas), builds Admin/KDS/POS, API (5 pruebas), auditoría de producción y Flutter analyze/test (1 prueba) superados. |
| `pnpm --filter @restaurant-os/api typecheck` y `node scripts/audit-public-baseline.mjs` | Correctos; typecheck API sin incidencias y auditoría pública sin rutas prohibidas ni patrones fuertes de secretos (398 archivos preparados). |
| Instalador PostgreSQL `17.11-5` | Correcto: hash Winget y Authenticode de EnterpriseDB Corporation válidos antes de ejecutar el instalador interactivo. |
| `Test-RestaurantNativeRequirements.ps1 -RequirePostgreSql` y `pg_isready` | Correctos: `psql`/`pg_isready` detectados en la instalación local, servicio `postgresql-x64-17` en ejecución y conexión lista en `127.0.0.1:5432`. |
| pgAdmin local | Correcto: autenticación manual de `postgres`; contraseña no expuesta. Se creó `restaurant_dev` vacía y se verificó el marcador técnico antes/después del reinicio. |
| Reinicio PostgreSQL y NestJS | Correctos: UAC reinició exclusivamente `postgresql-x64-17`, conservando loopback; NestJS respondió `200` en `127.0.0.1:3010` y se detuvo de forma controlada. |

Las pruebas React y HTTP se repitieron fuera del sandbox porque éste bloqueó respectivamente un renombrado temporal de Vitest (`EPERM`) y una conexión loopback (`EACCES`). Las repeticiones no aisladas son las que se registran como resultados válidos.

## Estado operativo nativo de Windows — 2026-10-30

El propietario aprobó el modo A nativo como cierre operativo de Fase 1.1 y prohibió instalar Docker Desktop, WSL 2 o solicitar cambios de BIOS/UEFI. La inspección real encontró Windows 11 Pro `10.0.26300` x64, AMD Ryzen 7 5700X, 31.92 GiB de RAM instalados y 17.86 GiB libres. Node `24.20.0` y PNPM `11.25.0` están disponibles; no existe `.env` ni variables de entorno de la aplicación.

PostgreSQL `17.11-5` se descargó desde `PostgreSQL.PostgreSQL.17` de Winget. Su SHA-256 coincide con `612c7f5400a003aaffa0372cb273eed52278f93c680ab911eb9cb2229e329072` y la firma Authenticode fue válida, de EnterpriseDB Corporation. Tras UAC y la contraseña introducida directamente por el propietario, quedó instalado como servicio automático `postgresql-x64-17`; ni la contraseña ni un equivalente se imprimieron, capturaron o versionaron.

El instalador inició con `listen_addresses = '*'`. Se creó un respaldo no sobrescribible `postgresql.conf.restaurant-os-fase-1.1.bak`, se cambió exclusivamente la escucha de PostgreSQL a `127.0.0.1` y se reinició sólo `postgresql-x64-17` mediante UAC. La comprobación posterior encontró un único listener `127.0.0.1:5432`, sin `0.0.0.0` ni `::`; `pg_isready` aceptó conexiones. No se modificaron BIOS/UEFI, WSL, Docker, particiones, antivirus, firewall ni otros servicios.

La autenticación local se verificó manualmente en pgAdmin por el propietario contra `postgres` como usuario `postgres`, sin guardar ni compartir la contraseña. Se creó `restaurant_dev` como base de desarrollo vacía. La persistencia se verificó con el esquema técnico aislado `phase_1_1_technical_verification` y el marcador `phase-1.1` en la base administrativa `postgres`: el marcador sobrevivió un reinicio controlado y el esquema quedó ausente tras la limpieza. Una consulta y un `DROP` iniciales se ejecutaron contra `restaurant_dev` y produjeron los errores esperados de objeto ausente; no dejaron datos y se corrigieron en la base adecuada.

NestJS volvió a responder `200` en `127.0.0.1:3010/api/v1/system/health`; Administración, KDS y POS habían respondido previamente en sus puertos loopback fijos. Los logs de PostgreSQL no contienen fallos de arranque o persistencia: sólo los mensajes esperados de reinicio y de las consultas manuales de objetos ausentes descritas arriba.

La demostración física con WAN aislada continúa **no evaluada**: no se desconectó ni modificó la red del equipo y no se simuló un resultado. Los servicios comprobados no requieren un SaaS o nube durante su arranque local después de instalar sus dependencias, pero esa condición no sustituye una prueba de red aislada.

Docker Compose se conserva intacto como modo B alternativo. No se ejecutaron ni se afirman como exitosos `docker compose config`, build, healthchecks, persistencia de volumen ni prueba sin WAN.

El workflow `.github/workflows/validation.yml` conserva trabajos independientes de React, NestJS, Flutter, seguridad e integridad/diseño; no requiere Docker Desktop del equipo de desarrollo. Está preparado para un futuro Pull Request a `Master`, pero no se publicó rama, no se creó Pull Request y no existe ejecución real de GitHub Actions en esta entrega.

## Seguridad y decisiones

- No se añadieron dependencias ni se modificó `pnpm-lock.yaml`.
- La auditoría pública y el modo de revisión excluyen las referencias PNG privadas; las validaciones locales preservaron los cuatro SHA-256 oficiales.
- La vulnerabilidad baja transitiva conocida de `deepmerge@4.3.1` permanece documentada; no aparece en la auditoría de dependencias de producción y no se aplicó una sustitución no soportada.
- ADR-010 aprobado por el propietario: desarrollo nativo Windows como modo oficial de Fase 1.1; Docker Compose alternativo, sin Docker/WSL/BIOS como requisitos.

## Paquete de revisión

`restaurant-os-fase-1.1-windows-revision.zip` reúne 74 archivos versionados de esta entrega: modo nativo Windows, alternativa Compose, API y pruebas técnicas, scripts, workflow, documentación y guía de revisión. Se verificó su extracción y la ausencia de dependencias instaladas, cachés, builds, APK, `.env`, credenciales, volúmenes y PNG internos de `design/reference/`.

El SHA-256 se entrega en el archivo adyacente `restaurant-os-fase-1.1-windows-revision.zip.sha256`, fuera del ZIP para evitar una referencia circular. Los commits locales de la entrega se conservan en `feature/phase-1-foundation`; la rama no se publicó ni se abrió Pull Request.

## Recomendación

Recomendar revisión de código y CI de la Fase 1.1. El entorno nativo y sus pruebas operativas están correctos; quedan como limitaciones explícitas la prueba física con WAN aislada y la ejecución real futura de GitHub Actions, pues la rama se mantiene local por instrucción del propietario. No iniciar la Fase 1.2 hasta recibir la autorización expresa correspondiente.
