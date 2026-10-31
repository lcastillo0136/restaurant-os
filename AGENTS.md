# AGENTS.md — instrucciones vinculantes para Codex

Lee en este orden: `docs/00-FUENTE-DE-VERDAD.md`, `docs/01-ARQUITECTURA.md`, `docs/02-MVP.md`, `docs/03-DISENO-UX.md`, `docs/06-CRITERIOS-ACEPTACION.md`, `docs/07-ADR.md`, `docs/09-PRIMER-PROMPT-CODEX.md`.

## Reglas de actuación
1. Este repositorio es la fuente de verdad del proyecto. Nunca sustituyas una decisión aprobada por una suposición.
2. Antes de programar, declara qué fase, alcance, archivos y criterios de aceptación abordarás.
3. Trabaja en incrementos pequeños; no adelantes módulos ni introduzcas SaaS, nube obligatoria, suscripciones o servicios remotos.
4. **Flutter es obligatorio para apps de tabletas y móviles**. Administración web y POS escritorio continúan con React. Kitchen monitor web React; tablet kitchen Flutter según destino.
5. Una sucursal inicialmente, `organization_id` y `branch_id` desde el comienzo. Nunca asumir sucursal global sin autorización.
6. Solo el servidor PostgreSQL es autoridad transaccional. Los clientes mantienen UI/cache, nunca confirman pedidos o cobros offline sin ACK.
7. Ningún pago con tarjeta se considera exitoso sin confirmación del proveedor. Facturas CFDI requieren PAC/SAT y acceso externo.
8. Tokens NFC/QR aleatorios y revocables; nunca poner datos personales en NFC. No automatizar inicio de sesión sensible sin controles.
9. Aplica HTTPS LAN, RBAC, auditoría, idempotencia, transacciones y DECIMAL para dinero.
10. Respeta los diseños y tokens. No modifiques navbar/layout arbitrariamente ni inventes branding nuevo.
11. Todo módulo debe tener pruebas unitarias, integración y casos negativos de autorización/concurrencia; provee instrucciones para reproducirlas.
12. Si falta un requerimiento, conserva interfaz extensible, documenta pregunta en `docs/10-PENDIENTES.md` y evita inventar reglas fiscales/comerciales.
13. Al finalizar cada entrega, documenta archivos creados, comandos ejecutados, resultados reales, riesgos y decisiones nuevas. No declares tests que no ejecutaste.
14. Cambios a la fuente de verdad únicamente mediante propuesta de ADR aprobada por el usuario.

## Política de pruebas eficientes

**Objetivo:** reducir el tiempo y los recursos dedicados a pruebas innecesarias, sin comprometer la estabilidad ni la seguridad del proyecto.

### Reglas obligatorias
1. **Pruebas proporcionales al cambio:** ejecutar únicamente las pruebas relacionadas con los archivos o módulos modificados.
2. **No repetir pruebas exitosas:** si una prueba pasó y el código relacionado no cambió, no volver a ejecutarla durante la misma tarea.
3. **Evitar validaciones globales:** no ejecutar todas las pruebas del monorepo ante cambios pequeños, documentales o visuales aislados.
4. **Cambios de documentación:** no requieren builds ni pruebas funcionales, salvo que afecten scripts, configuración o contratos ejecutables.
5. **No generar APK innecesariamente:** compilar Android solamente cuando los cambios afecten su funcionamiento o sea necesario validar una entrega.
6. **Pruebas de infraestructura:** evitar reinicios repetidos de servicios, instalaciones y pruebas de persistencia cuando ya existan resultados válidos y no haya cambios relevantes.
7. **Evitar duplicaciones:** no ejecutar varios comandos que comprueben exactamente lo mismo.
8. **Correcciones de errores:** ejecutar primero la prueba específica relacionada con el problema.
9. **Límite de reintentos:** si una prueba falla repetidamente por el mismo problema de entorno, detenerse después de un reintento razonable y documentar el bloqueo.
10. **Informes breves:** resumir las pruebas ejecutadas, su resultado y las que se omitieron justificadamente.

### Excepciones

Se permiten pruebas más amplias cuando:

- Se modifiquen dependencias críticas.
- Se alteren autenticación, seguridad, permisos o manejo de datos.
- Se realicen migraciones de base de datos.
- Existan cambios transversales que puedan producir regresiones.
- Se prepare una entrega importante que requiera validación integral.
- El propietario las solicite expresamente.

En esos casos, seleccionar las pruebas necesarias según el riesgo, sin repetirlas innecesariamente.

### Comportamiento esperado

Codex debe priorizar:

**Implementar → probar lo modificado → documentar → entregar.**

No debe intentar ejecutar exhaustivamente todas las pruebas disponibles por defecto.

Esta política aplica a todas las fases futuras.

## Flujo Git vinculante
1. `Master` contiene únicamente líneas base y entregas aprobadas.
2. Todo desarrollo nuevo ocurre en ramas `feature/*`; las correcciones aisladas usan `fix/*`.
3. No desarrollar funcionalidades directamente en `Master`. Integrar mediante Pull Request revisado y con las pruebas aplicables ejecutadas.
4. No reescribir historial publicado (`push --force`, rebase destructivo o eliminación de etiquetas publicadas) sin autorización expresa del propietario.
5. Antes de preparar un commit público, revisar secretos, datos personales, dependencias/builds y derechos de redistribución de recursos gráficos.
6. Los PNG de `design/reference/` son fuente visual interna, pero no se versionan ni distribuyen hasta contar con autorización comprobable. Sus hashes y nombres sí pueden documentarse.
7. Un repositorio público no concede por sí mismo permiso de reutilización. No añadir una licencia open source sin aprobación explícita del propietario.
