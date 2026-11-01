# Primer administrador — procedimiento controlado

**No ejecutar durante Fase 2.1.** La herramienta existe para una base aislada que reciba autorización específica posterior.

## Precondiciones humanas y técnicas

1. Matriz RBAC, rol y permisos mínimos aprobados por el propietario.
2. Base temporal nueva, autorizada e identificada; nunca `restaurant_dev`.
3. Migración de autenticación aplicada y confirmada en esa base.
4. Organización y, si corresponde, sucursal activas ya existentes y verificadas.
5. Respaldo válido y procedimiento de recuperación disponible.
6. Operador autorizado en una terminal local controlada; no usar sesión remota compartida ni registrar pantalla/terminal con secretos.

## Ejecución futura

La contraseña, el identificador y el nombre se solicitan interactivamente. Nunca incluir contraseñas en argumentos, scripts, `.env`, historial, logs o capturas. `FIRST_ADMIN_DATABASE_URL` se inyecta sólo en el entorno del proceso por el operador autorizado; la CLI no la imprime ni carga archivos `.env`.

```powershell
$env:FIRST_ADMIN_DATABASE_URL = '<URL privada de la base temporal autorizada>'
pnpm --filter @restaurant-os/api bootstrap:first-admin -- `
  --target-name '<nombre exacto de la base temporal>' `
  --organization-id '<uuid de organización autorizado>' `
  --role-code '<rol aprobado>' `
  --permission '<permiso aprobado 1>' `
  --approval-reference '<referencia interna no secreta>' `
  --confirm-first-administrator 'BOOTSTRAP-FIRST-ADMIN:<nombre exacto de la base temporal>'
Remove-Item Env:FIRST_ADMIN_DATABASE_URL
```

Use `--branch-id <uuid>` sólo si el rol aprobado es de sucursal. La lista repetida `--permission` debe ser exactamente la del rol activo. La confirmación final solicita otra vez el nombre de la base.

## Barreras verificables

- rechaza opciones incompletas, destino implícito, URL que no coincida con el destino y `restaurant_dev`;
- rechaza terminal no interactiva y no admite contraseña por argumento;
- no crea roles/permisos, no asume autoridad administrativa y no expone endpoint HTTP;
- adquiere advisory lock y usa aislamiento serializable;
- rechaza la operación cuando ya existe cualquier identidad, rol inactivo, permisos distintos, organización/sucursal inválida o identidad duplicada;
- registra sólo `ADMIN_BOOTSTRAP`, resultado, actor, organización, sucursal aplicable, código de rol y referencia de autorización no secreta.

Después, bajo la misma autorización, comprobar login, refresh, logout/revocación y la auditoría. Si falla cualquier comprobación, suspender el uso de la cuenta y seguir el plan de recuperación; no repetir el bootstrap ni modificar registros manualmente.
