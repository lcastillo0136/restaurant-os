# Sesiones y tokens

## Estrategia implementada

Se usan tokens opacos aleatorios de 256 bits, no JWT. PostgreSQL conserva únicamente SHA-256 de los tokens, nunca su valor recuperable. Cada sesión almacena hashes de acceso y renovación, expiración, familia, última utilización y revocación.

- Acceso: 900 segundos por defecto (`AUTH_ACCESS_TOKEN_TTL_SECONDS`, 60–3600).
- Renovación: 604800 segundos por defecto (`AUTH_REFRESH_TOKEN_TTL_SECONDS`, 3600–2592000).
- Al renovar, ambos valores se sustituyen mediante actualización condicional; un refresh anterior no se puede reutilizar.
- Logout marca la sesión revocada; cada autenticación verifica revocación, expiración y estado activo del usuario en servidor.

La estrategia funciona sin WAN y no necesita claves fijas en el código ni un proveedor externo. La contrapartida deliberada es una consulta indexada al servidor para validar acceso; la autorización resuelve roles/permisos en una consulta relacional, sin N+1.

## Clientes futuros

Android debe usar almacenamiento seguro de plataforma y nunca loguear tokens. Web debe preferir cookie `HttpOnly`, `Secure` y `SameSite` una vez exista TLS, con protección CSRF aprobada. No se recomienda `localStorage` para tokens sensibles.

Mientras la API permanezca en HTTP loopback no se deben usar credenciales reales desde LAN: HTTP sin TLS no protege contraseñas ni tokens frente a interceptación. CORS, dominio, certificados y CSRF para web continúan pendientes antes de exposición LAN.
