# Contratos Socket.IO técnicos v1

Namespace: `/realtime`. Transporte aceptado: WebSocket de Socket.IO. No se exponen eventos de pedidos, cocina, pagos, caja ni datos de restaurante en Fase 1.5.

## Handshake

El cliente presenta el token de acceso opaco de Fase 1.4 en el objeto de autenticación de Socket.IO:

```ts
io(`${baseUrl}/realtime`, { transports: ['websocket'], auth: { accessToken } });
```

No se usan query strings, URLs, nombres de sala ni identidad autodeclarada para conceder acceso. Un token ausente, con formato inválido, expirado, revocado o asociado a un usuario inactivo se rechaza. Un `Origin` presente debe estar explícitamente permitido; los clientes nativos que no envían `Origin` siguen requiriendo autenticación.

## Sobre de evento del servidor

Todos los eventos salen como `server.realtime.event`:

```ts
{
  eventId: 'UUID generado por el servidor',
  version: '1',
  type: 'technical.connection.ready',
  emittedAt: 'UTC ISO-8601',
  correlationId: 'UUID',
  organizationId?: 'UUID cuando aplica',
  branchId?: 'UUID cuando aplica',
  data: {}
}
```

Tipos disponibles:

| Tipo | Finalidad | Datos |
| --- | --- | --- |
| `technical.connection.ready` | Handshake aceptado y recomendaciones de reconexión. | límites de backoff recomendados. |
| `technical.subscription.confirmed` | Suscripción autorizada por servidor. | `eventType`. |
| `technical.communication.error` | Error seguro de comunicación. | código canónico, nunca un token ni detalle interno. |
| `technical.session.revalidated` | Reservado para confirmación técnica futura; no se emite aún. | — |

`eventId` identifica el mensaje técnico, no confirma ninguna operación comercial. La entrega de Socket.IO es **best-effort**: no hay persistencia, ack de negocio ni reenvío garantizado.

## Suscripción

Evento cliente: `client.realtime.subscribe`.

```ts
{
  organizationId: 'UUID',
  branchId?: 'UUID',
  eventTypes: ['technical.connection'],
  correlationId?: 'UUID'
}
```

El cliente no proporciona una room. El servidor valida formato, tamaño, organización, sucursal activa y pertenencia mediante `AuthorizationService.hasPermissions()`, incluida la comprobación defensiva aprobada en Fase 1.4. Para `technical.connection` exige `auth.session.read`; como no hay matriz ni permisos sembrados, la suscripción queda denegada por defecto fuera de pruebas aisladas. La sala resultante es interna y combina protocolo, organización, sucursal y tipo de evento.

Los eventos internos de módulos futuros no son contratos públicos. Cada nuevo evento requerirá versión, DTO mínimo, clasificación de sensibilidad, permiso/matriz aprobada, prueba de aislamiento, recuperación REST y decisión sobre persistencia antes de publicarse.
