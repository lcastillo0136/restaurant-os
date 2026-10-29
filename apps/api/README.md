# API — scaffold de Fase 0.1

Monolito NestJS preparado para módulos futuros. Solo expone `GET /api/v1/system/status` como comprobación técnica; no contiene autenticación, transacciones ni lógica comercial.

Tras instalar dependencias en la raíz:

```powershell
pnpm dev:api
```

La aplicación enlaza a `127.0.0.1` por defecto. La exposición en LAN requiere la configuración posterior de TLS local, RBAC y dispositivos autorizados.
