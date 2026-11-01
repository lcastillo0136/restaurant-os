# Seguridad de transporte, TLS y CORS

## Estado actual

La API y Socket.IO se mantienen en loopback. HTTP local sirve únicamente para desarrollo; no protege credenciales en una red compartida. No se abrieron puertos, no se modificó firewall, router, Windows, certificados del sistema ni se añadieron certificados al repositorio.

La configuración TLS es opcional para desarrollo local y compatible con material que administre el propietario:

```ini
API_TLS_ENABLED=true
API_TLS_KEY_PATH=C:/ruta-privada/server.key
API_TLS_CERT_PATH=C:/ruta-privada/server.crt
API_LAN_EXPOSURE_AUTHORIZED=true
API_ALLOWED_ORIGINS=https://admin.restaurante.local
API_WS_ALLOWED_ORIGINS=https://admin.restaurante.local
```

Las rutas no se registran ni se versionan; `.gitignore` excluye claves y certificados. Activar estas variables sin la autorización y preparación física correspondiente no autoriza una exposición LAN.

## Procedimiento posterior controlado por propietario

1. Aprobar dominio, VLAN/dispositivos, certificado confiable y orígenes concretos.
2. Guardar clave y certificado fuera del repositorio, con permisos del sistema gestionados por el propietario.
3. Configurar TLS y las listas exactas de origen; no usar `*`.
4. Autorizar específicamente la escucha LAN y configurar red/firewall fuera de Codex.
5. Verificar HTTPS/WSS desde un dispositivo autorizado, CORS/Origin, revocación de sesión y recuperación.

Un proxy inverso (por ejemplo Caddy) sigue siendo una opción posterior de infraestructura aprobable; no se añadió ni configuró en esta fase.

## Controles aplicados

- REST conserva CORS explícito sin comodines y `credentials: false`.
- Socket.IO valida `Origin` con la misma lista, rechaza origins browser no incluidos y no acepta tokens en query strings.
- La identidad se resuelve desde una sesión opaca persistida; los usuarios inactivos, sesiones expiradas o revocadas se desconectan.
- Las rooms no son accesibles por nombre del cliente; una suscripción requiere RBAC y comprobación de organización/sucursal activa.
- Se aplican límite de conexiones, tamaño de mensaje, ping/timeout, limpieza y errores canónicos sin secretos.
- Si en el futuro web usa cookies, será necesaria una política aprobada de `HttpOnly`, `Secure`, `SameSite` y CSRF. CORS no sustituye ninguno de esos controles.
