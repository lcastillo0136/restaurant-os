# Puertas de calidad
- Fase 0: revisiones de diseño de mesas y tablet, navegación, accesibilidad, targets 48dp, estados vacíos/errores/conectividad; aprobación explícita.
- Fundación: Docker localhost funcional, BD persistente, migración reproducible, seed seguro, login por rol, CI/test smoke y restore comprobado.
- Mesa: apertura única, cambio de estado consistente, segunda apertura concurrente rechazada.
- Pedido: con misma idempotency key no duplicar, snapshots de precios, separación por comensal.
- KDS: estación correcta, recuperación de evento al reconectar, autorización.
- Caja: efectivo/arquéo, cobro duplicado rechazado, propina separada y ticket; nunca borrar registros contables.
- Sistema real: prueba sin WAN, reconexión wifi, impresora, corte energético simulado con procedimiento y restauración; logs suficientes.

Documentar evidencia de pruebas ejecutadas. No afirmar "listo para producción" sin revisión fiscal, privacidad, seguridad y validación de hardware.
