# Fase 1.1 — Entorno local y automatización

**Estado:** aprobado formalmente de manera condicionada por el propietario; el cierre operativo depende de ejecutar Docker Compose. No equivale a preparación productiva ni autoriza la Fase 1.2.

## Alcance autorizado

Esta entrega prepara el entorno reproducible de desarrollo: Docker Compose, contenedor técnico de NestJS, PostgreSQL persistente preliminar, validación de variables, scripts PowerShell, CI y pruebas técnicas. No crea esquema, migraciones, entidades, usuarios, autenticación, pedidos, pagos, NFC/QR, CFDI, WebSockets productivos ni datos de negocio.

## Comprobación de equipo — 2026-10-30

| Comprobación | Resultado |
| --- | --- |
| Windows | Windows 11 Pro, versión `10.0.26300`, 64 bits |
| CPU / memoria | AMD Ryzen 7 5700X x64, 31.92 GiB instalados y 17.86 GiB libres durante la inspección |
| Capacidades CPU | Extensiones de monitor y SLAT disponibles |
| Virtualización de firmware | **Desactivada** (`VirtualizationFirmwareEnabled: False`) |
| WSL | No instalado; `wsl --status` y `wsl --version` indican que debe instalarse |
| Docker Desktop / CLI | No instalado: no hay ejecutable, servicio ni binario `docker` / `docker-compose` |
| Instalador oficial | Winget encuentra `Docker.DockerDesktop` 4.97.0, de Docker Inc.; no se descargó ni ejecutó |

La edición de Windows, la CPU y la RAM satisfacen el perfil de Docker Desktop. Sin embargo, el backend WSL 2 requiere virtualización habilitada en BIOS/UEFI y WSL. La modificación de firmware, la elevación para `wsl --install` y el reinicio no se realizaron: requieren la intervención explícita del propietario. Las consultas de características opcionales de Windows también solicitaron elevación.

## Servicios y límites

| Servicio | Estado en Fase 1.1 | Acceso |
| --- | --- | --- |
| `api` NestJS | Operativo técnicamente; sólo `GET /api/v1/system/health` y `GET /api/v1/system/status` | Host local `127.0.0.1:${API_PORT}` y red Compose interna |
| `postgres` | Infraestructura preliminar persistente; sin cliente, esquema ni migraciones de negocio | Host local `127.0.0.1:${POSTGRES_PORT}` y red Compose interna |

El backend no declara una conexión o una base de datos lista: el estado informa literalmente `preliminary-infrastructure-only`. La futura autoridad transaccional seguirá siendo PostgreSQL, pero integrarla es trabajo de la Fase 1.2 autorizada por separado.

## Red, persistencia y reinicio

- La red `restaurant_internal` conecta API y PostgreSQL.
- Los puertos publicados se limitan a `127.0.0.1`; no hay exposición pública por defecto.
- El volumen nombrado `postgres_data` sobrevive a `Stop-RestaurantServices.ps1`, reinicios y recreación normal de contenedores.
- Ningún script ejecuta `docker compose down -v`, borra el volumen ni modifica `.env` sin una instrucción explícita.
- Ambos servicios usan `restart: unless-stopped` y healthchecks. La API inicia después de que PostgreSQL informe salud.
- La instalación inicial puede descargar dependencias PNPM e imágenes Docker. Después, el Compose no depende de un SaaS, nube ni servicio WAN para sus funciones locales. La prueba real sin WAN queda pendiente de ejecutarse en un equipo con Docker.

## Variables

Copiar `.env.example` a `.env` y definir un secreto local propio para `POSTGRES_PASSWORD` antes de usar Compose. No versionar `.env`.

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

- `infra/docker-compose.dev.yml`: composición local sin servicios cloud.
- `apps/api/Dockerfile`: imagen no privilegiada que instala desde el lockfile y ejecuta sólo la API compilada.
- `.dockerignore`: evita enviar secretos, cachés, datos, ZIP y referencias visuales internas al contexto de construcción.
- `apps/api/src/environment.ts`: validación explícita del entorno.
- `scripts/ops/`: operaciones PowerShell reproducibles.
- `.github/workflows/validation.yml`: CI de validación, sin despliegue ni artefactos.

Consulta [GUIA-DESARROLLO.md](GUIA-DESARROLLO.md), [GUIA-CI.md](GUIA-CI.md) y [EVIDENCIAS-FASE-1.1.md](EVIDENCIAS-FASE-1.1.md) para el uso y resultados ejecutados.
