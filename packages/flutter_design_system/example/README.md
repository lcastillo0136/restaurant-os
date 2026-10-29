# Catálogo Flutter — Restaurant OS

Aplicación Android de demostración para los componentes Flutter de Fase 0.6.
Usa datos ficticios, no se conecta a servicios y no implementa operaciones de
negocio.

```powershell
cd packages/flutter_design_system
flutter analyze
flutter test
cd example
flutter analyze
flutter run -d <android-device>
```

La generación de APK puede requerir acceso de loopback para Gradle. No se creó
una plataforma Flutter Web como sustitución de la validación Android.
