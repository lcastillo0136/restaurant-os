# Manifiesto del paquete de revisión — Fase 2.5

El archivo `restaurant-os-fase-2.5-revision.zip` contiene exclusivamente los
archivos necesarios para revisar el panel administrativo en modo demostración:

- `apps/admin_web/package.json`, `apps/admin_web/vitest.config.ts` y
  `pnpm-lock.yaml` para el comando de pruebas focalizadas.
- `apps/admin_web/src/App.tsx`, `styles.css`, `data.ts` y los paneles
  administrativos nuevos.
- `apps/admin_web/test/phase-2.5/data.test.ts`, `app.test.tsx` y
  `panels.test.tsx`.
- Esta documentación, `FASE-2.5-PANEL-ADMINISTRATIVO.md`, `STATUS.md` y
  `10-PENDIENTES.md`.

Se excluyen `node_modules`, `dist`, cachés, bases de datos, respaldos,
credenciales, variables privadas, certificados, tokens y las cuatro referencias
visuales privadas de `design/reference/`.
