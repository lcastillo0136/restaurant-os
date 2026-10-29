# Operaciones críticas — Fase 0.2

Las siguientes son especificaciones UX y de autorización. No sustituyen la validación transaccional, auditoría o idempotencia del backend.

| Operación | Precondiciones UX | Confirmación y permiso | Resultado permitido | Error/recuperación |
| --- | --- | --- | --- | --- |
| Cancelar pedido | pedido localizado, estado/version visible, motivo capturable | modal de consecuencia + `orders.cancel`; autorización adicional si la política lo define | solo tras ACK; conservar auditoría y cocina informada | conflicto/ya preparado/sin permiso: refrescar, no ocultar rastro |
| Modificar orden enviada | pedido e ítem en estado modificable según servidor | revisar diferencia, impacto en cocina y `orders.modify_sent` | ACK crea modificación/auditoría; KDS recibe actualización | si estación avanzó o cambió versión, mostrar estado actual y alternativa autorizada |
| Aplicar descuento | cuenta abierta, origen/motivo de descuento disponible | confirmación con importe y `discounts.apply`; posible segunda autorización **PENDIENTE** | resumen y auditoría solo tras ACK | política/monto no definido, permiso o conflicto: bloquear y explicar |
| Cerrar caja | turno activo, movimientos/snapshot/arqueo visibles | confirmación crítica, diferencias visibles, `cash.close`; supervisión adicional **PENDIENTE** | caja cerrada y bloqueada para cobros tras ACK | pendiente, diferencia, red o conflicto: no afirmar cierre; conservar borrador |
| Reembolso | POSTERIOR; pago proveedor confirmado y reglas definidas | doble confirmación, motivo, `payments.refund` y adaptador de proveedor | solo confirmación real del proveedor | no simular éxito; mantener pendiente/rechazado y conciliación |
| Cerrar mesa | condición de saldo/pedidos/dispositivo visible | confirmar cierre + `tables.close` | sesión cerrada; mesa pasa a limpiar tras ACK | precondición faltante/conflicto: no liberar mesa |
| Cambio de mesa | origen/destino y sesiones/versiones visibles | revisar impacto + `tables.transfer` | ACK actualiza sesión y dispositivos afectados | destino ocupado/bloqueado o conflicto: restaurar snapshot, no duplicar sesión |
| Liberar dispositivo cliente | mesa/sesión y dispositivo identificados | confirmar fin de vínculo + `devices.release` | sesión pública se invalida tras ACK | red/permiso: dispositivo permanece bloqueado en pantalla segura; no exponer otra mesa |
| Error de impresión | pago/recibo ya confirmado o solicitud permitida | reintento/reimpresión con `tickets.print`/`tickets.reprint` | estado de cola/impreso/error de gateway auditado | no revertir pago ni declarar ticket impreso sin respuesta del gateway |
| Pérdida de conectividad | indicador de red y último snapshot visibles | no requiere confirmación; bloquea mutaciones no confirmables | modo visual/contingencia marcado | reconectar, obtener snapshot, reconciliar claves idempotentes |

## Patrones de confirmación

1. **Explicar efecto:** entidad afectada, operación irreversible o compensatoria, permiso requerido y estado actual.
2. **Pedir intención explícita:** botón con verbo concreto; cancelar es visualmente distinto de confirmar.
3. **Enviar una sola intención:** clave idempotente cuando corresponda y control deshabilitado mientras espera ACK.
4. **Mostrar resultado verificable:** respuesta, versión, auditoría/recibo o causa de rechazo. No cerrar automáticamente el modal si se desconoce el resultado.

## Restricciones no negociables

- Una cancelación o reembolso no borra transacciones: crea registro compensatorio/auditado.
- Un error de red no se interpreta como rechazo ni confirmación; el estado es desconocido hasta reconciliar.
- Tarjeta, CFDI, PAC, descuento permitido, monto/límite de descuento, motivo obligatorio, doble autorización y política de reembolso requieren decisiones que aún no existen. La UX debe mostrar `no disponible` o solicitar autorización, no inventar reglas.
