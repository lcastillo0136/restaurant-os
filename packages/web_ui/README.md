# Restaurant OS Web UI

Biblioteca visual React de Fase 0.6. Consume los adaptadores generados desde
`design/tokens/` y no contiene lógica de negocio, red ni persistencia.

```powershell
pnpm --filter @restaurant-os/web-ui typecheck
pnpm --filter @restaurant-os/web-ui lint
pnpm --filter @restaurant-os/web-ui test
pnpm --filter @restaurant-os/web-ui build
node scripts/serve-phase-0.6-catalog.mjs
```

El catálogo queda disponible en `http://127.0.0.1:4198/` después del build.
Los cuatro temas se seleccionan mediante `data-theme`.
