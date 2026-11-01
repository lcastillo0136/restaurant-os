# Primer administrador — procedimiento pendiente de ejecución

No se creó una cuenta predeterminada, contraseña conocida ni seed administrativo en Fase 1.4.

Antes de crear el primer administrador, el propietario debe aprobar explícitamente la matriz definitiva de roles/permisos y autorizar una operación local de base aislada. El procedimiento deberá:

1. Ejecutarse localmente con intervención del propietario y contra una base identificada.
2. Solicitar identificador y contraseña de forma interactiva; nunca aceptar la contraseña por argumento, archivo versionado, log o captura.
3. Normalizar el identificador como `LOCAL`, crear el hash Argon2id y comprobar que no existe una identidad o administrador duplicado.
4. Asignar solo un rol aprobado, con `organization_id` y, cuando aplique, `branch_id` válidos.
5. Registrar un evento de seguridad sin secretos y verificar login/rotación/revocación antes de utilizar credenciales reales.

No existe todavía un endpoint público de bootstrap ni se ejecutará este procedimiento sin esa autorización específica. La recuperación o revocación del primer administrador también requiere una política aprobada y auditoría revisable.
