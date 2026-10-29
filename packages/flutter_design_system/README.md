# Restaurant OS Flutter Design System

Tokens, temas y componentes visuales compartidos por las aplicaciones Flutter
de cliente y meseros. Los valores de diseño se generan desde los siete JSON de
`design/tokens/`; no edite manualmente `lib/src/generated/design_tokens.g.dart`.

```powershell
node scripts/generate-design-tokens.mjs
cd packages/flutter_design_system
flutter analyze
flutter test
cd example
flutter run -d <android-device>
```

El paquete prioriza Android, objetivos táctiles de 48 dp y semántica accesible.
No contiene NFC, QR, pagos, persistencia ni conexiones reales.
