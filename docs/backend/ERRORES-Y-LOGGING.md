# Errores y logging

## Respuesta segura

El filtro global convierte excepciones HTTP y fallos inesperados en un formato uniforme. Los mensajes de cliente son canónicos (`BAD_REQUEST`, `NOT_FOUND`, `PAYLOAD_TOO_LARGE`, `INTERNAL_ERROR`, entre otros) y no reutilizan mensajes arbitrarios de errores internos.

Un fallo inesperado registra internamente solo: tipo de error, método, ruta sin query, código HTTP e identificador de solicitud. No registra el mensaje, stack, cuerpo, encabezados, cookies, tokens, contraseñas ni `DATABASE_URL`.

## Registro por solicitud

El interceptor emite un evento `http_request_completed` con `requestId`, método, ruta, estado y duración. El identificador se genera en el servidor para evitar que valores controlados por clientes contaminen los registros.

## Límites

El parser JSON usa `API_BODY_LIMIT_BYTES` (65,536 por defecto, entre 1,024 y 1,048,576). Los cuerpos mayores reciben `413` con el mismo formato seguro. No se almacenan cuerpos completos para diagnóstico.
