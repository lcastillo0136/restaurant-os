# Reconexión, recuperación y resiliencia

## Principios

Socket.IO solo comunica cambios técnicos en esta fase. PostgreSQL y REST son autoritativos; una reconexión no recupera permisos ni confirma operaciones. No existe broker, cola, outbox ni garantía de entrega.

Los clientes React y Flutter futuros deben exponer estado `connecting`, `connected`, `reconnecting`, `disconnected` y `session-invalid`. No deben reintentar de forma ilimitada ni reenviar una mutación no idempotente por el mero hecho de reconectar.

## Backoff recomendado

Usar hasta ocho intentos con base de 500 ms, tope de 30 s y variación aleatoria. Para el intento `n`:

```text
espera = min(30 000 ms, 500 ms × 2^n) × aleatorio(0.8, 1.2)
```

Detenerse al recibir `technical.communication.error` con `SESSION_INVALID` o al superar el límite. En ese caso el cliente debe invalidar su estado de sesión local, usar el flujo de autenticación/renovación aprobado y volver a crear el socket solo con un token vigente. No guardar tokens en URL ni registrarlos; Android debe usar almacenamiento seguro de plataforma y web deberá esperar la política TLS/cookie/CSRF pendiente.

## Secuencia de recuperación

1. Detectar `disconnect` o timeout de ping y bloquear acciones que exijan ACK del servidor.
2. Reintentar con backoff limitado y token vigente en `auth.accessToken`.
3. Tras `technical.connection.ready`, solicitar de REST un snapshot autorizado de cada recurso que el cliente muestre cuando existan esos endpoints.
4. Reenviar únicamente peticiones idempotentes con su clave original y solo si el contrato futuro lo permite; nunca duplicar pedidos, pagos, caja ni cambios de estado.
5. Solicitar de nuevo cada suscripción. El servidor vuelve a comprobar sesión, organización, sucursal y permisos, por lo que una revocación no persiste tras reconectar.

No se debe inferir que se recibieron todos los eventos entre dos conexiones. Para recursos comerciales, una fase posterior deberá definir snapshot, versión/concurrencia, cursor de eventos y política de persistencia/confirmación antes de prometer recuperación o entrega garantizada.
