# API — núcleo de Fase 1.3

Monolito modular NestJS con infraestructura compartida para módulos futuros. Expone únicamente endpoints técnicos bajo `/api/v1/system`; no contiene autenticación, transacciones de negocio, pedidos, caja, cocina ni pagos.

Tras instalar dependencias en la raíz:

```powershell
pnpm dev:api
```

La aplicación enlaza a `127.0.0.1` por defecto. `API_BODY_LIMIT_BYTES` limita cuerpos JSON a 65,536 bytes por defecto. La exposición en LAN requiere la configuración posterior de TLS local, RBAC y dispositivos autorizados.

Consulte `docs/backend/` para contratos, errores, logging, configuración y seguridad.
