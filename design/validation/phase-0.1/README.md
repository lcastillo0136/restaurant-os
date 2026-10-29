# Evidencia visual — Fase 0.1

Este directorio contiene capturas PNG de renders reales de las muestras estáticas de React, generadas desde los builds Vite en un navegador local Chromium headless. No son imágenes generadas artificialmente.

| Archivo | Entorno | Render |
| --- | --- | --- |
| `01-admin-react.png` | Administración | React/Vite, 1440 × 1080 |
| `03-kds-react.png` | Cocina KDS | React/Vite, 1440 × 900 |
| `04-pos-react.png` | POS | React/Vite, 1440 × 900 |

La captura de la tableta Flutter queda pendiente: el proyecto se creó exclusivamente para Android, no tiene destino web configurado, no hay dispositivo Android conectado y el empaquetado Android falla antes de compilar por la conexión loopback de Gradle/JDK. No se añadió web como sustituto de Android solo para producir una imagen.

SHA-256 de evidencia: `01-admin-react.png` `a739098428bedc25d60d750545c84116be3ea80c8a904df9d4d08ec02e445925`; `03-kds-react.png` `54677c00587fe55570f95fad67cc4273e0866df56dbca64380c3910d9a9926cf`; `04-pos-react.png` `17480646912ddb2c1d9aec1183de8d9a370bf85e286fd7daf1ebf82a48ff78b3`.
