# Registro de decisiones (ADR)
- ADR-001 APROBADO: local-first, servidor LAN y única BD PostgreSQL.
- ADR-002 APROBADO: sucursal inicial, preparada para múltiples.
- ADR-003 APROBADO: backend monolito modular NestJS + TypeScript.
- ADR-004 APROBADO: Flutter obligatorio para móvil/tabletas Android; React para web escritorio.
- ADR-005 APROBADO: Fase 0 diseño previo, UX/UI v1.0 temas por contexto.
- ADR-006 APROBADO: MVP pedido-cocina-caja efectivo-ticket; NFC, tarjetas y CFDI posteriores.
- ADR-007 PROPUESTO: MVVM + repositories/services en Flutter, Riverpod como candidato no aprobado.
- ADR-008 PENDIENTE: proveedor de pagos, PAC, impresoras, modelos de tableta y lector NFC/QR.
- ADR-009 APROBADO: los cuatro PNG nombrados en `design/reference/` son la fuente de verdad visual oficial; administración usa navegación superior horizontal, POS lateral compacta y las cuatro familias de tema están aprobadas, con valores específicos sujetos a revisión visual.
- ADR-010 APROBADO (2026-10-30): Fase 1.1 adopta desarrollo nativo en Windows con Node.js, PNPM y PostgreSQL local como modo operativo oficial. Docker Compose se conserva como alternativa futura, sin requerir Docker Desktop, WSL 2 ni cambios de BIOS/UEFI. No altera local-first, PostgreSQL como autoridad transaccional ni autoriza Fase 1.2.

Cada cambio: contexto -> opciones -> decisión -> consecuencias -> aprobación usuario.
