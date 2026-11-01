# Pruebas pendientes de autorización — Fase 1.6

Las siguientes comprobaciones no se ejecutaron. Requieren autorización específica porque crearían o modificarían datos, archivos sensibles, red o servicios del equipo.

## PostgreSQL temporal aislado

El propietario debe autorizar una base nueva y temporal, distinta de `restaurant_dev`, y definir quién la crea/elimina. Entonces se podrá:

1. Crear la base temporal y una cuenta de alcance mínimo mediante el procedimiento aprobado por el propietario.
2. Aplicar las migraciones en esa base, incluida `20261101000100_authentication_authorization`.
3. Ejecutar login persistido, refresh, logout, RBAC, FK de organización/sucursal y readiness real contra esa base.
4. Registrar resultados sin imprimir URL, contraseña ni tokens.
5. Eliminar la base temporal solo si esa eliminación también fue autorizada explícitamente.

No usar `restaurant_dev`, no alterar cuentas existentes y no ejecutar `prisma migrate` hasta contar con esa autorización.

## Respaldo y restauración

Usar únicamente un respaldo ficticio y una base temporal autorizada. Validar `pg_restore --list`, restauración, integridad y limpieza bajo control del propietario. No sobrescribir una base existente ni respaldos reales.

## TLS, WSS y LAN

Antes de escuchar fuera de loopback: aprobar dominio LAN, VLAN/dispositivos, origen CORS, certificado local y clave privada administrados por el propietario, además de la exposición de red. Luego comprobar HTTPS/WSS desde otro equipo autorizado, autenticación, revocación y origen rechazado. No crear certificados, abrir firewall ni cambiar router durante Fase 1.6.

## Pruebas físicas posteriores

Documentar por separado conexión Android, desconexión/reconexión Wi-Fi, operación simultánea y prueba física sin WAN. Ninguna debe simularse deshabilitando la red del equipo; requiere dispositivos y autorización específica.
