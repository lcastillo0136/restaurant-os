# Manifiesto de revisión — Fase 1.5

El paquete `restaurant-os-fase-1.5-revision.zip` contiene solamente los archivos de Fase 1.5:

- Configuración segura: `.env.example`, `apps/api/package.json`, `pnpm-lock.yaml`, `apps/api/src/environment.ts`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`.
- Módulo backend: `apps/api/src/realtime/`.
- Pruebas focalizadas: `apps/api/test/unit/environment.test.mjs`, `realtime.contracts.test.mjs`, `realtime.gateway.test.mjs`, `apps/api/test/integration/health.test.mjs` y `payload-limit.test.mjs`.
- Documentación: los archivos de `docs/network/` y las actualizaciones de `docs/STATUS.md` y `docs/10-PENDIENTES.md`.

Excluye `.env` privados, credenciales, tokens, claves, certificados, bases, respaldos, `node_modules`, `dist`, cachés, binarios y las referencias visuales privadas. El SHA-256 se registra fuera del ZIP para no modificar el artefacto después de calcularlo.
