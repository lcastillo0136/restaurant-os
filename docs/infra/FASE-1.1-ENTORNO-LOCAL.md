# Fase 1.1 — Entorno local y automatización

**Estado:** aprobado formalmente de manera condicionada por el propietario. El modo oficial de cierre operativo es desarrollo nativo en Windows; Docker Compose queda como alternativa futura no obligatoria. No equivale a preparación productiva ni autoriza la Fase 1.2.

## Alcance autorizado

Esta entrega prepara el entorno reproducible de desarrollo nativo: Node.js, PNPM, PostgreSQL como servicio local, API NestJS técnica, validación de variables, scripts PowerShell, CI y pruebas técnicas. Docker Compose y el contenedor técnico existente se conservan sin cambios como alternativa futura. No crea esquema, migraciones, entidades, usuarios, autenticación, pedidos, pagos, NFC/QR, CFDI, WebSockets productivos ni datos de negocio.

## Comprobación de equipo — 2026-10-30

| Comprobación | Resultado |
| --- | --- |
| Windows | Windows 11 Pro, versión `10.0.26300`, 64 bits |
| CPU / memoria | AMD Ryzen 7 5700X x64, 31.92 GiB instalados y 17.86 GiB libres durante la inspección |
| Capacidades CPU | Extensiones de monitor y SLAT disponibles |
| Virtualización de firmware | Desactivada; no es requisito del modo nativo |
| WSL / Docker Desktop | No instalados; por decisión del propietario no se instalan ni se solicitan cambios de BIOS/UEFI |
| Node.js / PNPM | `24.20.0` / `11.25.0`, disponibles |
| PostgreSQL nativo | No instalado: sin binario `psql`, servicio, registro de instalación ni escucha en `5432`/`5433` |
| Puertos iniciales | `3000`, `5173`, `5174`, `5175`, `5432` y `5433` libres durante la inspección |
| Instalador propuesto | PostgreSQL `17.11-5` oficial, `PostgreSQL.PostgreSQL.17` de Winget; SHA-256 `612c7f5400a003aaffa0372cb273eed52278f93c680ab911eb9cb2229e329072`; no descargado ni ejecutado |

El equipo satisface el perfil de PostgreSQL 17. La instalación gráfica oficial requiere privilegios de administrador y la contraseña inicial se debe introducir localmente, nunca en un archivo versionado ni en esta documentación. Antes de ejecutar el instalador elevado se requiere autorización adicional del propietario. Se prevé instalar sólo el servidor y herramientas de línea de comandos, en `C:\Program Files\PostgreSQL\17` con datos en `C:\Program Files\PostgreSQL\17\data`; el servicio y la escucha se verificarán y se restringirán a `127.0.0.1` antes de usarlo.

## Servicios y límites

| Servicio | Estado en Fase 1.1 | Acceso |
| --- | --- | --- |
| `api` NestJS | Operativo técnicamente; sólo `GET /api/v1/system/health` y `GET /api/v1/system/status` | Host local `127.0.0.1:${API_PORT}` |
| PostgreSQL nativo | Pendiente de instalación; sin esquema, migraciones ni datos de negocio | Sólo `127.0.0.1:5432` tras la configuración |

El backend no declara una conexión o una base de datos lista: el estado informa literalmente `preliminary-infrastructure-only`. La futura autoridad transaccional seguirá siendo PostgreSQL, pero integrarla es trabajo de la Fase 1.2 autorizada por separado.

## Modos de instalación

### Modo A — Desarrollo nativo Windows (oficial actualmente)

- Node.js, PNPM y NestJS se ejecutan directamente en Windows; la API valida host, puerto, modo y CORS por variables de entorno.
- PostgreSQL 17 será un servicio local de Windows y escuchará exclusivamente en `127.0.0.1:5432`; no se abrirán reglas de firewall ni accesos externos.
- Administración, KDS y POS se ejecutan en `127.0.0.1:5173`, `127.0.0.1:5174` y `127.0.0.1:5175`, respectivamente. `strictPort` evita que Vite cambie de puerto sin dejar evidencia.
- La prueba de persistencia crea el esquema temporal aislado `phase_1_1_technical_verification`, reinicia únicamente el servicio PostgreSQL detectado y elimina ese esquema sólo después de confirmar el marcador. No toca tablas de negocio.

### Modo B — Docker Compose (alternativo, no obligatorio)

- La red `restaurant_internal`, los puertos loopback, el volumen `postgres_data`, los healthchecks y los scripts Docker existentes se conservan sin cambios.
- Ningún script Docker ejecuta `docker compose down -v`, borra el volumen ni modifica `.env` sin una instrucción explícita.
- No se instaló Docker Desktop, WSL 2 ni se ejecutó Compose por decisión del propietario; sus pruebas dinámicas no se declaran realizadas.

## Variables

La API nativa usa `API_HOST=127.0.0.1`, `API_PORT=3000`, `API_EXECUTION_MODE=development` y CORS vacío por defecto. PostgreSQL nativo solicita su contraseña como `SecureString` al ejecutar pruebas administrativas; no se guarda en el repositorio. `.env.example` se conserva exclusivamente para el modo Compose.

| Variable | Uso | Valor ejemplo seguro sólo para desarrollo |
| --- | --- | --- |
| `COMPOSE_PROJECT_NAME` | Nombre aislado del proyecto Compose | `restaurant-os-dev` |
| `POSTGRES_IMAGE` | Imagen preliminar de PostgreSQL | `postgres:17` |
| `POSTGRES_DB`, `POSTGRES_USER` | Base y usuario locales | `restaurant_dev` |
| `POSTGRES_PASSWORD` | Secreto local obligatorio de Compose | `<define-a-local-development-secret>` |
| `POSTGRES_PORT` | Puerto local de PostgreSQL | `5433` |
| `API_HOST`, `API_PORT` | Enlace local al ejecutar Nest fuera de Compose | `127.0.0.1`, `3000` |
| `API_EXECUTION_MODE` | `development`, `docker` o `test` | `development` |
| `API_ALLOWED_ORIGINS` | Orígenes HTTP(S) separados por coma; vacío desactiva CORS | vacío |

La API rechaza puertos fuera de 1–65535, hosts con esquema/ruta, modos no permitidos y orígenes CORS que no sean HTTP(S) completos. No se permiten comodines y `credentials` queda desactivado. La lista de orígenes debe mantenerse vacía mientras ninguna app web consuma la API; su apertura requiere la configuración LAN/TLS y el permiso del incremento que implemente dicha integración.

## Archivos principales

- `scripts/ops/Native-Restaurant.Common.ps1` y los scripts `*Native*`: operaciones nativas aisladas, con control de procesos iniciados por el proyecto y comprobaciones de loopback.
- `infra/docker-compose.dev.yml`: composición local alternativa sin servicios cloud.
- `apps/api/Dockerfile`: imagen alternativa no privilegiada que instala desde el lockfile y ejecuta sólo la API compilada.
- `.dockerignore`: evita enviar secretos, cachés, datos, ZIP y referencias visuales internas al contexto de construcción.
- `apps/api/src/environment.ts`: validación explícita del entorno.
- `scripts/ops/`: operaciones PowerShell reproducibles.
- `.github/workflows/validation.yml`: CI de validación, sin despliegue ni artefactos.

Consulta [GUIA-DESARROLLO.md](GUIA-DESARROLLO.md), [GUIA-CI.md](GUIA-CI.md) y [EVIDENCIAS-FASE-1.1.md](EVIDENCIAS-FASE-1.1.md) para el uso y resultados ejecutados.
