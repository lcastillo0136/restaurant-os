# Contratos API iniciales (a implementar después de Fase 0)
- POST /api/v1/auth/login
- GET /api/v1/branches/current
- GET /api/v1/tables
- POST /api/v1/tables/{id}/sessions
- GET /api/v1/menu
- POST /api/v1/orders (Idempotency-Key obligatorio)
- GET /api/v1/orders/{id}
- PATCH /api/v1/kitchen/items/{id}/status
- POST /api/v1/cash-shifts
- POST /api/v1/payments/cash (Idempotency-Key obligatorio)
- POST /api/v1/table-sessions/{id}/close
- GET /api/v1/reports/daily-sales

## WebSocket events
order.created, order.item.accepted, order.item.ready, order.item.delivered, table.session.opened/closed, payment.confirmed, cash.shift.closed.

Cada evento contiene event_id, branch_id, resource_id, version, emitted_at, payload mínimo. Al reconectar, GET snapshot del servidor. Nunca confiar en ID de sucursal proporcionado por cliente sin verificación de permiso.
