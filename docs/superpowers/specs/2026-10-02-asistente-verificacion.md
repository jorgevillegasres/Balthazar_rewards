# Verificación del asistente contextual

- 34 pruebas de dominio, almacenamiento, asistente y transporte OpenAI simulado: pasan.
- Compilación de Next.js y TypeScript: pasan. La ruta de vista simulada se eliminó antes de compilar la versión final.
- Navegador: captura asistida, confirmación de pasos y propuesta diaria verificadas con datos sintéticos. Sin errores ni avisos de consola. Ancho 390: documento 390, diálogo 362, sin desbordamiento horizontal; ancho 900: diálogo 620, contenido vertical.
- Endpoint local: sin sesión devuelve 401; origen externo devuelve 403; respuestas private/no-store.
- Cuota SQL: transacción autenticada con 22 reservas devuelve 20..1,0,0. Rollback confirmado; cero reservas de prueba persistidas. La exclusión concurrente utiliza bloqueo transaccional por usuario y fue revisada en código; no se ejecutó una prueba de carga concurrente contra producción.
- RLS: sin lectura anónima, sin UPDATE/DELETE para authenticated; permiso de INSERT limitado a propietario y día actual. La comprobación de día se realiza en política, no en restricción que impediría restaurar históricos.
- Revisión independiente: resueltos conflicto CSS con consola y conservación de fechas explícitas. Sin hallazgos importantes pendientes en la revisión final.
- Asesor de Supabase: sin advertencias de RLS/tablas expuestas en las nuevas tablas. Advierte protección de contraseñas filtradas desactivada en Auth, configuración existente ajena a esta función: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Pendiente de activación

La clave OpenAI no estaba configurada en Render al comprobar la integración. No se ha realizado una consulta real ni evaluado la calidad del modelo real. El propietario recibió instrucciones para configurar OPENAI_API_KEY y facturación; el primer uso pide consentimiento del contexto enviado. La interfaz tiene un aviso explícito de falta de configuración. Las respuestas de prueba no se presentan como resultados de OpenAI.
# Diagnóstico de la primera consulta real

Tras configurar la clave en Render, el propietario reportó el mensaje genérico de propuesta inválida. Dos consultas reales a OpenAI con el mismo transporte de producción y contexto de prueba terminaron con HTTP 200, estado completed y propuestas aceptadas por validateProposal; una usó la frase que el propietario compartió en su captura. No se enviaron tareas ni proyectos del propietario en estas pruebas y no se guardó ni imprimió la clave.

El error original todavía no se reprodujo. Se añadió instrumentación de fallos por etapa (state/context/quota/provider/validation), una referencia de ocho caracteres y metadatos acotados del proveedor. No registra solicitudes, respuestas, claves, identidades ni contenido de tareas. Los errores desconocidos se reducen a OTHER; los códigos del proveedor se limitan a una lista explícita. La referencia se muestra en el mensaje de error para correlacionar un nuevo intento del propietario con los registros.

La nueva prueba comprueba que un fallo del proveedor conserva únicamente estado HTTP y código permitido, que una respuesta incompleta identifica max_output_tokens, y que códigos inesperados y mensajes privados no se registran. Las 35 pruebas pasan. Sigue pendiente reproducir el fallo desde la sesión del propietario y corregir su causa; esta instrumentación no se presenta como una corrección del error original.
