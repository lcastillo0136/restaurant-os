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
| Análisis sintáctico de los 8 scripts PowerShell | Correcto. |

Las pruebas React y HTTP se repitieron fuera del sandbox porque éste bloqueó respectivamente un renombrado temporal de Vitest (`EPERM`) y una conexión loopback (`EACCES`). Las repeticiones no aisladas son las que se registran como resultados válidos.

## Bloqueo de Docker

`docker --version` y `Test-RestaurantRequirements.ps1 -RequireDocker` fallaron porque Docker no está instalado o no está disponible en el `PATH` de este equipo. Por esa razón no se ejecutaron ni se afirman como exitosos:

- `docker compose config --quiet`;
- build de la imagen API;
- arranque de `api` y `postgres`;
- healthchecks de Compose, `pg_isready`, persistencia, parada/reinicio o prueba sin WAN.

No se instaló Docker, no se cambió virtualización, no se creó `.env` ni se modificó configuración global. Las comprobaciones estáticas sí verifican la estructura de Compose y los scripts para que estas pruebas se reproduzcan después.

## Seguridad y decisiones

- No se añadieron dependencias ni se modificó `pnpm-lock.yaml`.
- La auditoría pública y el modo de revisión excluyen las referencias PNG privadas; las validaciones locales preservaron los cuatro SHA-256 oficiales.
- La vulnerabilidad baja transitiva conocida de `deepmerge@4.3.1` permanece documentada; no aparece en la auditoría de dependencias de producción y no se aplicó una sustitución no soportada.
- No hay ADR nuevo: la red local, PostgreSQL único, NestJS, Flutter/React y la restricción de loopback derivan de decisiones ya aprobadas.

## Recomendación

Recomendar revisión de código y CI de la Fase 1.1. La aprobación técnica final debe quedar condicionada a ejecutar `Test-RestaurantCompose.ps1`, parada/reinicio y prueba de persistencia en un equipo autorizado con Docker disponible. No iniciar la Fase 1.2 hasta recibir la autorización expresa correspondiente.
