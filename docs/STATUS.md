# Estado de proyecto
Fecha: 2026-10-29
- [x] Documentación de fuente de verdad inicial preparada.
- [x] Replanteo plataforma móvil/tablet como Flutter.
- [x] Las cuatro referencias PNG son la fuente de verdad visual oficial; SHA-256 originales suministrados por el propietario y coincidentes, documentados en `docs/design/REFERENCIAS-VISUALES.md`.
- [x] Las familias `admin-light`, `customer-warm`, `kitchen-dark` y `pos-light` están aprobadas como dirección estética; sus valores quedan sujetos a revisión visual.
- [x] Administración definida con navegación superior horizontal; POS conserva navegación lateral compacta.
- [x] `design/tokens/` normalizado como única fuente de valores; `design/tokens.json` convertido a manifiesto sin valores duplicados.
- [x] Scaffold generado: Flutter Android, shell React/Vite, API NestJS y workspace pnpm.
- [x] Fase 0.1 completada y aprobada con observación técnica de empaquetado Android/Gradle documentada.
- [x] Fase 0.2 arquitectura UX documentada y autorizada: navegación, mapas de pantalla, flujos, estados, roles/dispositivos, operaciones críticas y criterios.
- [x] Fase 0.3: 46 wireframes estáticos documentados para administración, tableta cliente, KDS, POS y meseros; sin lógica funcional ni cambios de arquitectura.
- [x] Fase 0.3 aprobada visualmente por el propietario el 2026-10-29.
- [x] Fase 0.4, Entrega 1: seis mockups de alta fidelidad, visor local, variante horizontal de tableta y siete capturas reales generados y validados técnicamente.
- [x] Fase 0.4, Entrega 1 aprobada formalmente por el propietario; sus seis mockups y siete capturas se conservan inmutables.
- [x] Fase 0.4, Entrega 2: 40 mockups restantes, índice de 46 destinos, estados UX y 40 capturas reales completados y validados técnicamente.
- [x] Fase 0.4, Entrega 2 aprobada formalmente por el propietario; los 46 mockups son la referencia visual oficial de interfaces.
- [x] Fase 0.5: cinco prototipos interactivos, 46 destinos, datos ficticios, 11 estados UX, pruebas y ocho capturas completados y validados técnicamente.
- [x] Fase 0.5 aprobada formalmente por el propietario; la línea base de las Fases 0.1 a 0.5 queda cerrada.
- [x] Preparación local de control de versiones autorizada para la línea base 0.1–0.5; rama principal `Master` y etiqueta `design-v0.5-approved` definidas.
- [x] Repositorio público publicado en `https://github.com/lcastillo0136/restaurant-os`; `origin` usa SSH y la rama predeterminada es `Master`.
- [x] Commit inicial `d984203a467c1a1a2329b6b569510dc0c0213955` y etiqueta anotada `design-v0.5-approved` verificados local y remotamente.
- [x] Rama local `feature/phase-0.6-design-components` creada desde `Master`; no publicada y sin implementación de Fase 0.6.
- [ ] Fase 0.6 no iniciada.
- [ ] Fase 0.7 no iniciada.
- [ ] Migraciones y API ejecutadas.
- [x] Pruebas de scaffold React/Nest ejecutadas; resultados documentados abajo.
- [ ] MVP construido.

## Evidencia de esta entrega

- `flutter doctor -v`: correcto; Flutter 3.47.7, Android SDK 36 y licencias disponibles.
- `flutter create --platforms=android --empty apps/table_kiosk`: correcto.
- `dart format apps/table_kiosk/lib apps/table_kiosk/test packages/flutter_design_system/lib`: correcto; la escritura de telemetría fuera del workspace fue denegada, sin afectar el formato.
- `flutter --no-version-check pub get`: correcto; resolvió el paquete local `flutter_design_system`.
- `flutter --no-version-check analyze`: correcto, sin incidencias.
- `flutter --no-version-check test`: correcto, 1 prueba de widget superada.
- `node scripts/validate-scaffold.mjs` y `pnpm validate:scaffold`: correctos tras la corrección; 29 rutas requeridas, exactamente 4 PNG con integridad SHA-256 local, 7 JSON canónicos y 4 temas sincronizados verificados.
- `pnpm --filter @restaurant-os/admin-web build`: correcto; typecheck y build Vite superados nuevamente después de declarar `admin-light` en la shell.
- `pnpm --filter @restaurant-os/api typecheck` y `pnpm --filter @restaurant-os/api build`: correctos.
- `pnpm install`: correcto con lockfile; solo se aprobó el build de `esbuild` para Vite.
- Corrección Fase 0.1: siete JSON en `design/tokens/` presentes y válidos; manifiesto, nombres de tema, referencias oficiales y contratos React/Flutter normalizados. `flutter analyze` y `flutter test` se repitieron: sin incidencias y 1 prueba superada.
- Validación final Fase 0.1: los cuatro SHA-256 originales coinciden; tres muestras React fueron compiladas, capturadas e inspeccionadas. Evidencia en `design/validation/phase-0.1/` y reporte en `docs/design/VALIDACION-FASE-0.1.md`.
- Captura Flutter: no realizada. El proyecto es Android-only, no hay dispositivo conectado y no se añadió una plataforma web de sustitución; el bloqueo Gradle/JDK se mantiene documentado.
- `pnpm peers check`: aviso transitorio de Nest CLI (`schema-utils@4.8.1` solicita webpack `^5.112.0`; instalado `5.106.2`). No bloqueó los builds ejecutados ni se modificó fuera del alcance de Fase 0.1.
- Fase 0.2: revisión documental de `NAVEGACION.md`, `MAPA-PANTALLAS.md`, `FLUJOS-USUARIO.md`, `ESTADOS-UX.md`, `ROLES-Y-DISPOSITIVOS.md`, `OPERACIONES-CRITICAS.md` y `CRITERIOS-UX.md`; 7/7 entregables presentes, 22/22 flujos identificados y bloques Mermaid verificados. Sin cambios de código, tokens, imágenes, arquitectura ni dependencias.
- Fase 0.3 corregida tras auditoría: `WIREFRAMES.md` es el catálogo canónico de 46 IDs/nombres/entornos/rutas; `MAPA-PANTALLAS.md` conserva la Fase 0.2 como agrupación conceptual histórica y contiene una vista derivada de 46 filas validada campo por campo. Se corrigieron especialmente ADM-05, ADM-06, ADM-08, TAB-03, KDS-02 y POS-01 sin renumerar archivos.
- Fase 0.3 corregida: tableta cliente vertical principal con variante horizontal adaptable; objetivos táctiles de 48 px; KDS más legible y con desconexión coherente; estados ACK con capa no contradictoria; resumen POS contextual para cuenta/apertura/cierre; identidad provisional `Restaurant OS`.
- `node --check design/wireframes/assets/wireframe.js`, `node --check scripts/validate-phase-0.3.mjs`, `node scripts/validate-phase-0.3.mjs` y `node scripts/validate-scaffold.mjs`: correctos. Resultado: 46 IDs/nombres/entornos/rutas coherentes entre catálogo, mapa y visor; recursos locales presentes; siete tokens JSON válidos; cuatro temas sincronizados y cuatro referencias oficiales con SHA-256 coincidente.
- Evidencia visual Fase 0.3: seis capturas reales de Chrome headless (dashboard, bienvenida vertical, menú vertical, KDS, POS y mesero) en `design/validation/phase-0.3/`; no se generaron imágenes artificiales.
- Paquete de revisión aprobado: `restaurant-os-fase-0.3-revision.zip`, 14/14 archivos, sin dependencias ni builds; SHA-256 `68EC3A77436A38E64FCEC7901EA5CDD6B66A7944B0A06CD5103191F5C49BF49F`. Una primera invocación de empaquetado con `-LiteralPath` no produjo archivo; la repetición con `-Path` fue correcta y auditada. El ZIP se conserva sin regenerar como artefacto exacto que recibió la aprobación.
- Cierre Fase 0.3: aprobación visual expresa recibida del propietario el 2026-10-29; no se modificaron los 46 wireframes ni las cuatro referencias oficiales durante el registro del cierre.
- Fase 0.4 Entrega 1: creados `ADM-02`, `TAB-01`, `TAB-03`, `KDS-01`, `POS-03` y `WAI-02` en `design/mockups/phase-0.4/`, con metadatos de rol, plataforma, resolución, tokens, wireframe, referencia y aprobación pendiente. Se mantuvieron los identificadores canónicos.
- Visor Fase 0.4: índice y cinco destinos HTML/CSS/JavaScript estáticos, sin API, almacenamiento, lógica productiva ni recursos externos. La tableta abre en vertical y conserva variante horizontal adaptable sin crear otro ID.
- Recursos Fase 0.4: ilustraciones gastronómicas e iconos SVG locales marcados como demostración; no se copiaron marcas, personas, productos, precios ni fotografías de las referencias. Inter no se distribuyó y continúa usando fallback hasta aprobar origen/licencia.
- `node --check design/mockups/phase-0.4/assets/mockups.js`, `node --check scripts/validate-phase-0.4.mjs` y `node scripts/validate-phase-0.4.mjs`: correctos. Resultado: 6/6 mockups canónicos, cinco entornos, cuatro temas, siete tokens, objetivos táctiles, orientación, estados no engañosos, siete PNG y cuatro SHA-256 oficiales verificados.
- Evidencia visual Fase 0.4: siete capturas reales de Microsoft Edge Chromium headless contra `127.0.0.1:4190` en `design/mockups/phase-0.4/captures/`. Chrome headless no produjo archivos en los primeros intentos y no se contabilizó como evidencia.
- Limpieza Fase 0.4: 12 perfiles efímeros de Chrome/Edge inspeccionados y eliminados de `design/mockups/phase-0.4/`; `.gitignore` excluye perfiles de captura futuros. No se eliminaron fuentes ni capturas válidas.
- Registro histórico Fase 0.4: en aquel momento `git status --short` no pudo ejecutarse porque el directorio aún no contenía metadata `.git`. Este impedimento quedó resuelto al inicializar y publicar la línea base aprobada 0.1–0.5.
- Paquete Fase 0.4 Entrega 1: `restaurant-os-fase-0.4-entrega-1-revision.zip` preparado con 20 archivos, sin dependencias, cachés, perfiles de navegador, secretos ni builds. Se extrajo en un directorio temporal y el índice, cinco entornos y una captura respondieron HTTP `200`; el SHA-256 se reporta en el informe externo porque incluirlo dentro del propio ZIP alteraría el hash.
- Fase 0.4 Entrega 2: el visor se amplió mediante `assets/delivery-2.css`, `assets/delivery-2.js`, `assets/index-delivery-2.js` y cinco catálogos `delivery-2.html`, sin modificar los ocho archivos fuente ni las siete capturas de la Entrega 1. La portada recorre 46/46 IDs y conserva enlaces directos a los seis mockups aprobados.
- Entrega 2 representa los 11 estados documentales (`normal`, vacío, carga, error, desconexión, pendiente ACK, ACK servidor, sin permiso, validación, conflicto y cancelación). Pedidos, cobros, cierres y transiciones KDS no se expresan como confirmados antes del ACK.
- POS conserva rail y panel derecho: consumo en cobro; resumen de caja en `POS-08`; resumen de turno/arqueo en `POS-09`. KDS-07 muestra explícitamente desconexión, snapshot desactualizado y mutaciones bloqueadas.
- `node --check design/mockups/phase-0.4/assets/delivery-2.js`, `node --check design/mockups/phase-0.4/assets/index-delivery-2.js`, `node --check scripts/validate-phase-0.4-delivery-2.mjs` y `node scripts/validate-phase-0.4-delivery-2.mjs`: correctos. Resultado: 46/46 IDs/títulos/rutas; 40 nuevos + 6 aprobados; 15 hashes congelados de Entrega 1; 47 PNG; cuatro temas; siete tokens; objetivos táctiles; recursos locales; estados críticos y cuatro referencias oficiales.
- `node scripts/validate-phase-0.3.mjs` y `node scripts/validate-scaffold.mjs`: correctos después de la extensión; no hubo regresión en wireframes, tokens, nombres, rutas ni referencias.
- Evidencia Entrega 2: 40 capturas reales de Microsoft Edge Chromium headless contra `127.0.0.1:4191`, una por cada mockup nuevo, almacenadas junto con las siete de Entrega 1 en `design/mockups/phase-0.4/captures/`. No se usaron imágenes generadas artificialmente.
- Prueba HTTP Entrega 2: la primera ejecución dentro del sandbox no pudo abrir loopback; se repitió con permiso local y validó 17 recursos con HTTP `200` y una ruta ausente con `404`. La misma prueba se repitió correctamente desde la extracción independiente del paquete.
- Paquete Entrega 2: una primera auditoría detectó que el visor se había comprimido como `design/mockups/` en lugar de `design/mockups/phase-0.4/`; ese ZIP se eliminó y regeneró. La estructura final extraída contiene 86 archivos, 47 capturas, README, referencias, tokens y documentación, sin dependencias, builds, cachés, perfiles, secretos ni temporales. El SHA-256 final se reporta fuera del propio ZIP para evitar una referencia circular.
- Cierre Fase 0.4: el propietario aprobó formalmente la fase completa al autorizar Fase 0.5. Los 46 mockups y su variante horizontal se conservaron sin modificaciones; Fase 0.5 reutiliza copias verificadas de sus capturas.
- Fase 0.5: creada implementación separada en `design/prototypes/phase-0.5/` con índice, Administración, Tableta cliente, KDS, POS y Meseros. La navegación cubre los 46 IDs/rutas canónicos y usa una capa interactiva externa sobre las superficies visuales aprobadas.
- Datos Fase 0.5: `demo-data.js` centraliza organización/sucursal, mesas, empleados, productos, pedido, estación, caja y cuenta ficticios. Todo vive en memoria; no se usa información personal real, backend, WebSocket, almacenamiento del navegador ni servicios externos.
- ACK Fase 0.5: pedidos, atención, KDS, apertura/cobro/cierre y entrega pasan primero por `Pendiente de ACK`; solo `Emitir ACK simulado` actualiza el estado ficticio. Offline bloquea mutaciones. El ticket incluye `DOCUMENTO DE DEMOSTRACIÓN — SIN VALIDEZ FISCAL`.
- `node scripts/test-phase-0.5-navigation.mjs`: correcto; 46 destinos, 11 estados y cinco recorridos completos con ACK simulado.
- `node scripts/validate-phase-0.5.mjs`: correcto; 46/46 títulos/rutas/imágenes, 47 superficies idénticas a Fase 0.4, cuatro referencias oficiales, datos demo, reinicio, ausencia de red/persistencia y ocho capturas verificadas.
- `node scripts/test-phase-0.5-http.mjs`: correcto; 15 recursos con HTTP `200` y ruta inexistente con `404`.
- Capturas Fase 0.5: ocho PNG reales generados con Microsoft Edge Chromium headless contra `127.0.0.1:4197`, incluyendo ACK simulado y ticket de demostración.
- `node scripts/validate-phase-0.4-delivery-2.mjs`, `node scripts/validate-phase-0.3.mjs` y `node scripts/validate-scaffold.mjs`: correctos después de implementar los prototipos.
- Paquete Fase 0.5: extracción independiente con 140 archivos, 47 superficies aprobadas, ocho capturas, README y pruebas. Cero dependencias, builds, cachés, perfiles, secretos o temporales; navegación/validador correctos y 15 recursos HTTP `200` más ruta inexistente `404`. El SHA-256 final se reporta fuera del ZIP para evitar referencia circular.
- Preparación Git pública: las cuatro referencias PNG oficiales se conservan localmente pero se excluyen del historial por no existir autorización comprobable de redistribución. También se excluyen los ZIP de revisión que contienen copias, dependencias, builds, perfiles, bases locales, secretos y material de firma.
- Auditoría previa al commit: búsqueda de llaves privadas, tokens comunes, credenciales, correos incrustados y datos bancarios sin hallazgos reales; `.env.example` solo contiene placeholders. `gitleaks` no está instalado, por lo que se añadió una comprobación reproducible del conjunto preparado en `scripts/audit-public-baseline.mjs`.
- Licencia pública: no se seleccionó ninguna licencia open source. La autorización de licencia del código y la redistribución de las cuatro referencias visuales quedan pendientes del propietario.
- GitHub: `gh auth status` confirmó la cuenta `lcastillo0136`; el repositorio se creó vacío y público, sin README, licencia ni `.gitignore` generados por GitHub. `origin` quedó configurado como `git@github.com:lcastillo0136/restaurant-os.git`.
- Publicación: `Master` y la etiqueta `design-v0.5-approved` se publicaron sin `--force`. GitHub reporta `Master` como rama predeterminada y el commit remoto coincide con `d984203a467c1a1a2329b6b569510dc0c0213955`.
- SSH: el primer push se detuvo por host desconocido; se registró la clave ED25519 de `github.com` con `StrictHostKeyChecking=accept-new`, la autenticación respondió como `lcastillo0136` y el reintento fue correcto.
- `flutter build apk --debug` y un segundo intento `gradlew assembleDebug --no-daemon`: no completaron por `Unable to establish loopback connection` de Gradle/JDK en este entorno. El fallo ocurre antes de compilar el proyecto; no se generó APK y requiere revisar la política de loopback local del equipo.
- Docker/Compose: no instalados en el entorno, por lo que no se levantó PostgreSQL.

## Próxima revisión

La publicación de la línea base está cerrada. La rama local `feature/phase-0.6-design-components` queda preparada, pero la Fase 0.6 no inicia automáticamente. No publicar esta rama ni iniciar Fase 0.6, Fase 0.7, desarrollo funcional, módulos de negocio o integraciones hasta una instrucción expresa.
