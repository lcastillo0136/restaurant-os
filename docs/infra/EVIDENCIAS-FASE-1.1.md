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

Las pruebas React y HTTP se repitieron fuera del sandbox porque éste bloqueó respectivamente un renombrado temporal de Vitest (`EPERM`) y una conexión loopback (`EACCES`). Las repeticiones no aisladas son las que se registran como resultados válidos.

## Estado operativo nativo de Windows — 2026-10-30

El propietario aprobó el modo A nativo como cierre operativo de Fase 1.1 y prohibió instalar Docker Desktop, WSL 2 o solicitar cambios de BIOS/UEFI. La inspección real encontró Windows 11 Pro `10.0.26300` x64, AMD Ryzen 7 5700X, 31.92 GiB de RAM instalados y 17.86 GiB libres. Node `24.20.0` y PNPM `11.25.0` están disponibles; no existe `.env` ni variables de entorno de la aplicación.

No se detectó PostgreSQL: `psql` y `pg_isready` no están en PATH, no hay instalación en el registro o `C:\Program Files\PostgreSQL`, no hay servicio PostgreSQL y no hay escuchas en `5432` ni `5433`. Los puertos `3000`, `5173`, `5174` y `5175` también estaban libres. La consulta de servicios se realizó sin modificar el sistema.

Winget identifica PostgreSQL `17.11-5` como `PostgreSQL.PostgreSQL.17`, publicado por PostgreSQL Global Development Group con instalador oficial EDB `postgresql-17.11-5-windows-x64.exe` y SHA-256 `612c7f5400a003aaffa0372cb273eed52278f93c680ab911eb9cb2229e329072`. No se descargó ni ejecutó. La instalación exige UAC/privilegios administrativos y contraseña inicial local, por lo que espera autorización específica del propietario.

No se modificaron BIOS/UEFI, virtualización, WSL, Docker, particiones, antivirus, firewall ni configuraciones globales. Tampoco se crearon bases, esquemas, tablas o datos de negocio.

Por ello, estas validaciones nativas siguen **pendientes** y no se afirman como exitosas:

- arranque del servicio PostgreSQL, escucha exclusiva en `127.0.0.1`, healthcheck y consulta técnica;
- arranque coordinado de NestJS y las tres aplicaciones React mediante scripts nativos;
- reinicio controlado de PostgreSQL y persistencia del esquema técnico temporal;
- demostración real de operación posterior sin dependencia obligatoria de internet.

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

Recomendar revisión de código y CI de la Fase 1.1. El cierre técnico queda condicionado a autorizar e instalar PostgreSQL nativo, ejecutar las pruebas operativas reales y registrar sus resultados. No iniciar la Fase 1.2 hasta recibir la autorización expresa correspondiente.
