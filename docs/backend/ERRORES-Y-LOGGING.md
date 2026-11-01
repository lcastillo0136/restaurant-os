# Errores y logging

## Respuesta segura

El filtro global convierte excepciones HTTP y fallos inesperados en un formato uniforme. Los mensajes de cliente son canónicos (`BAD_REQUEST`, `NOT_FOUND`, `PAYLOAD_TOO_LARGE`, `INTERNAL_ERROR`, entre otros) y no reutilizan mensajes arbitrarios de errores internos.

Un fallo inesperado registra internamente solo: tipo de error, método, ruta sin query, código HTTP e identificador de solicitud. No registra el mensaje, stack, cuerpo, encabezados, cookies, tokens, contraseñas ni `DATABASE_URL`.

## Registro por solicitud

El interceptor emite exactamente un evento `http_request_completed` al finalizar la respuesta HTTP, con `requestId`, método, ruta, estado y duración. Así registra el código finalmente enviado por Express —incluidos `400` y `500` normalizados por el filtro global— y no un estado provisional. El identificador se genera en el servidor para evitar que valores controlados por clientes contaminen los registros.

## Límites

El parser JSON usa `API_BODY_LIMIT_BYTES` (65,536 por defecto, entre 1,024 y 1,048,576). Los encabezados de seguridad y el identificador de solicitud se añaden antes del parser; por ello los cuerpos mayores reciben `413` con el mismo formato seguro, encabezados y `requestId`. No se almacenan cuerpos completos para diagnóstico.
