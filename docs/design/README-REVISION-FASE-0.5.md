# Restaurant OS — revisión de Fase 0.5

## Abrir

Desde la raíz extraída:

```powershell
node scripts/serve-phase-0.5-review.mjs
```

Abrir `http://127.0.0.1:4195/`. El visor no requiere instalar dependencias ni acceder a internet.

## Revisar

- Elegir uno de los cinco entornos.
- Usar las acciones del panel derecho para recorrer el flujo.
- Resolver operaciones pendientes con `Emitir ACK simulado`, error o conflicto.
- Forzar los 11 estados UX desde el selector.
- Usar `Restablecer demo` para volver al estado inicial.
- En POS, abrir el ticket y comprobar la leyenda `DOCUMENTO DE DEMOSTRACIÓN — SIN VALIDEZ FISCAL`.

Todos los datos son ficticios y viven solo en memoria. El prototipo no contiene backend, persistencia, pagos, CFDI, NFC/QR funcional ni código productivo.

## Pruebas

```powershell
node scripts/test-phase-0.5-navigation.mjs
node scripts/validate-phase-0.5.mjs
node scripts/test-phase-0.5-http.mjs
```

La Fase 0.5 permanece pendiente de aprobación del propietario. No iniciar Fase 0.6 desde este paquete.
