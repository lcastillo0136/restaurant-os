# MVP v1 — alcance y límites

## IN
Configuración organización/sucursal, usuarios/roles, empleados y turnos básicos; áreas/mesas/estados; catálogo/modificadores/alérgenos; Android Flutter table kiosk con guest checkout y carrito; pedidos con atribución comensal; KDS web en monitor; pagos efectivo y cierre de caja; tickets de consumo ESC/POS mediante servicio gateway; propina voluntaria; reportes básicos; auditoría; backup y restore; prueba LAN real.

## OUT antes de v1
NFC/QR identificador cliente, favoritos persistentes y CRM; pago con tarjeta automático; CFDI timbrado; multiserver sucursales; inventario; delivery; suscripciones; integración cloud obligatoria. Preparar modelos y adaptadores, no falsas implementaciones.

## Flujo de aceptación E2E
Admin abre turno y configura 1 área, 2 mesas, 3 platos -> vincula tableta mesa 01 -> invitado elige items -> pedido se confirma 1 sola vez -> KDS recibe -> cocinero marca listo -> mesero entrega -> cajero cobra efectivo más propina -> ticket -> mesa en limpieza -> mesa disponible -> cierre turno con arqueo -> reporte y auditoría.

## Restricciones
No almacenar tarjeta bancaria o CVV. Recibos locales no son CFDI. Factura no podrá declararse timbrada offline. Confirmación de órdenes requiere respuesta de servidor.
