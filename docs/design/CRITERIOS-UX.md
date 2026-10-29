# Criterios UX para revisión de Fase 0.2

## Navegación y roles

- [ ] Cada rol de `ROLES-Y-DISPOSITIVOS.md` llega solo a sus módulos y acciones autorizadas.
- [ ] Administración conserva navbar horizontal superior; POS rail lateral compacto; KDS tablero de columnas; tableta experiencia pública de mesa.
- [ ] Toda ruta de detalle vuelve a autorizar recurso, sucursal y versión antes de mutar.
- [ ] El dispositivo de mesa no aparece como usuario ni obtiene navegación administrativa.

## Flujos

- [ ] Los 22 flujos documentados especifican actor, entrada, pasos, resultado, variantes/errores y permiso.
- [ ] Los flujos MVP están separados de NFC/QR, tarjeta, reembolso, CFDI, CRM, división avanzada y reportes avanzados posteriores.
- [ ] Pedido y pago usan estado pendiente e idempotencia hasta ACK; no existen mensajes de éxito especulativos.
- [ ] Mesa y caja contemplan concurrencia, limpieza/cierre y auditoría.

## Estados y accesibilidad

- [ ] Cada interfaz cubre carga, vacío, error, sin conexión, reconexión, pendiente, confirmado, sesión expirada, permiso insuficiente, cancelación, validación y conflicto concurrente.
- [ ] Color no es la única señal; foco visible, textos claros, iconos y targets de 48 dp se consideran en wireframes.
- [ ] La desconexión propone recuperación sin confirmar operaciones locales.

## Preparación para Fase 0.3

- [ ] Los wireframes pueden derivarse de `NAVEGACION.md`, `MAPA-PANTALLAS.md` y `FLUJOS-USUARIO.md` sin inventar destinos o permisos.
- [ ] Las operaciones críticas incluyen precondiciones, confirmaciones, permisos, estados pendientes y recuperación.
- [ ] Las decisiones comerciales/fiscales faltantes están en `docs/10-PENDIENTES.md`, no codificadas como reglas.
- [ ] El propietario revisa y aprueba los documentos antes de iniciar wireframes de Fase 0.3.
