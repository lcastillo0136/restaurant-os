# PROMPT PARA CODEX — copiar completo

Actúa como arquitecto e implementador de Restaurant OS. Lee `AGENTS.md` y toda la documentación exigida. La FUENTE DE VERDAD es `docs/00-FUENTE-DE-VERDAD.md`; no modifiques alcance, plataformas ni diseño sin aprobación.

OBJETIVO DE ESTA EJECUCIÓN: iniciar únicamente la Fase 0.1 y fundación técnica mínima, sin desarrollar módulos de ventas. Audita estructura inicial, comprueba herramientas instaladas, crea monorepo reproducible, crea app Android Flutter `apps/table_kiosk`, backend NestJS y administración React, configura PostgreSQL dev y autenticación/roles iniciales solo en siguiente incremento si el entorno está listo. Usa Flutter, NO React Native ni Ionic ni PWA como sustituto para tableta. Respeta tokens y mockups `design/`. Si necesitas decisiones nuevas regístralas como PENDIENTE, no las inventes.

ENTREGABLES: árbol real de archivos; documentación de cómo ejecutar cada app; primeras pantallas estáticas de identidad del sistema en React y Flutter (sin simular datos reales); componentes base y ThemeData Flutter; Docker local solo dev; pruebas ejecutadas con resultados reales; documento `docs/STATUS.md` con pendientes y próximos pasos. Prioriza establecer Fase 0 de diseño y compartir una vista para aprobación antes de iniciar lógica de negocio.

REGLAS: no incluir servicios en la nube, no activar pagos ni timbrado, no agregar dependencias incompatibles, no declarar producción preparada; revisar accesibilidad, tablet 48dp, orientaciones; aplicar seguridad y arquitectura en todo scaffold. Presenta archivos y comandos de ejecución sin ocultar errores.
