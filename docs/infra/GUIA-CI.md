# Guía de integración continua

El workflow [validation.yml](../../.github/workflows/validation.yml) sólo se ejecuta en Pull Requests cuyo destino es `Master` y en actualizaciones de `Master`. No hay disparador manual de despliegue, publicación, APK, carga de artefactos ni secretos de producción.

## Seguridad y compatibilidad

- Usa el permiso mínimo `contents: read` y una clave de concurrencia que cancela ejecuciones antiguas de la misma referencia.
- Instala Node `24.20.0` y PNPM `11.25.0` con `pnpm install --frozen-lockfile`.
- Usa `actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v4` y `subosito/flutter-action@v2`. Estas referencias se verificaron el 2026-10-30 contra la documentación de sus mantenedores; antes de actualizar acciones se debe revisar compatibilidad y permisos de nuevo.
- La CI no recibe las cuatro referencias PNG privadas. Los validadores de Fase 0 usan `--review-package`: exigen que dichas imágenes no estén presentes, mientras que los hashes siguen documentados en `docs/design/REFERENCIAS-VISUALES.md` y se verifican sólo en el entorno local autorizado.

## Jobs

| Job | Validación |
| --- | --- |
| `design-integrity-public` | Auditoría pública, validadores de Fases 0.1, 0.3–0.7.1 en modo público y configuración Fase 1.1 |
| `react` | TypeScript, ESLint, Vitest y builds de Administración, KDS y POS |
| `api` | TypeScript, pruebas unitarias de entorno/controlador y prueba de integración HTTP en loopback |
| `flutter` | `flutter pub get`, `flutter analyze` y `flutter test` de `table_kiosk`; no usa Android físico ni publica APK |
| `security-production` | Instalación desde lockfile y `pnpm audit --prod --audit-level high` |

La auditoría de producción falla ante vulnerabilidades altas o críticas. La vulnerabilidad baja transitiva conocida de `deepmerge@4.3.1`, limitada al tooling de Nest CLI y sin parche compatible disponible, sigue registrada en `docs/10-PENDIENTES.md`; no forma parte del grafo de producción.

## Revisión independiente

En un clon limpio sin imágenes privadas, reproduce los jobs Node con:

```powershell
pnpm install --frozen-lockfile
node scripts/audit-public-baseline.mjs
pnpm validate:design:public
pnpm validate:infra
pnpm test:web
pnpm build:web
pnpm test:api
pnpm audit:production
```

En un runner con Flutter `3.47.7`, añade:

```powershell
Set-Location apps/table_kiosk
flutter pub get
flutter analyze
flutter test
```

La CI valida calidad de código y del entorno, no una operación LAN real, privacidad, fiscalidad, proveedores de pago, hardware ni preparación de producción.
