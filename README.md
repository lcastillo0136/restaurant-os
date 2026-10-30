# Restaurant OS

**Estado:** Fase 0 cerrada y aprobada. Fase 1.1 preparada para revisión, con verificación dinámica de Docker pendiente en un equipo que lo tenga disponible. **No es un sistema listo para producción ni contiene módulos transaccionales.**

## Inicio rápido

1. Lee `AGENTS.md` y los documentos en el orden indicado.
2. Revisa `docs/00-FUENTE-DE-VERDAD.md`, `docs/STATUS.md` y los contratos UX en `docs/design/`.
3. Copia `.env.example` a `.env` y define un secreto local solo si vas a ejecutar PostgreSQL de desarrollo.
4. Ejecuta `pnpm install` y luego `pnpm validate:scaffold`.
5. Para revisar el prototipo aprobado, sirve `design/prototypes/phase-0.5/` mediante HTTP local y abre su `index.html`.
6. Para las vistas de base: `pnpm dev:admin` y `cd apps/table_kiosk; flutter test`.

Docker Compose está documentado en `infra/docker-compose.dev.yml`, pero necesita Docker instalado. No lo expongas a internet ni uses sus valores de ejemplo en producción. Consulta `docs/infra/` para scripts, CI y evidencia ejecutada.

## Tecnologías aprobadas
- **Flutter/Dart** obligatorio para tabletas Android en mesas y las apps móviles futuras. Para las pantallas de cocina en tabletas se utilizará Flutter; cocina en monitor puede usar React web.
- React/TypeScript para administración web y POS web en escritorio.
- NestJS/TypeScript, PostgreSQL, Prisma, Socket.IO, Caddy y Docker Compose en servidor LAN.
- Diseño compartido por contratos/tokens entre Flutter y React; **no** intentar importar widgets React en Flutter.

## Estructura actual

- `apps/api`: NestJS técnico, únicamente `GET /api/v1/system/health` y `GET /api/v1/system/status`; sin dominio de negocio ni conexión de base de datos.
- `apps/admin_web`: shell React/Vite estática de identidad.
- `apps/table_kiosk`: app Flutter Android estática de identidad.
- `packages/*`: tokens CSS, tema Flutter, contratos y configuración base.
- `design/tokens/`: siete fuentes canónicas de tokens de diseño.
- `design/wireframes/`: 46 wireframes aprobados.
- `design/mockups/phase-0.4/`: 46 mockups aprobados.
- `design/prototypes/phase-0.5/`: prototipo interactivo aprobado, exclusivamente demostrativo.
- `docs/design/`: contratos UX, inventarios y evidencia de las fases de diseño.

## Etapa actual

La línea base de diseño 0.1–0.7.1 está aprobada. La Fase 1.1 prepara el entorno local y CI; no autoriza esquema de negocio, autenticación ni módulos funcionales. No iniciar la Fase 1.2 sin instrucción expresa del propietario.

## Recursos visuales y publicación

Las cuatro imágenes oficiales de `design/reference/` se conservan localmente como fuente de verdad visual, pero están excluidas del repositorio público porque no existe autorización comprobable de redistribución. Los paquetes ZIP de revisión también se excluyen porque contienen esas referencias. Consulta `design/reference/README.md`.

Los mockups usan ilustraciones SVG/CSS propias y fallback tipográfico del sistema. Inter no se distribuye y la importación/licencia de Lucide para Flutter sigue pendiente de validación.

## Contribución y licencia

El flujo de ramas y revisión se documenta en `CONTRIBUTING.md` y `docs/GIT-WORKFLOW.md`. No se ha aprobado una licencia open source. La visibilidad pública del repositorio no concede permiso de copia, modificación o redistribución.
