# Balta: perfil y recuerdos elegidos

El usuario eligió explícitamente «Un perfil y recuerdos concretos que yo le pida guardar, revisables y borrables». Se incorpora esa autorización al alcance de personalización y al estilo ya aprobado; no se conservan conversaciones ni audio completos.

## Experiencia

Perfil → Configuración incluye «Así trabaja Balta conmigo»: apelativo opcional (60 caracteres), cómo trabajo/qué me ayuda (600), humor expresivo/discreto/serio y acompañamiento equilibrado/suave/directo. Un control explícito permite usar este perfil y sus recuerdos en consultas de texto y voz. Por defecto, los espacios existentes no tienen información personalizada que compartir.

«Lo que Balta recuerda» permite guardar, revisar, editar y borrar hasta veinte recuerdos de 400 caracteres. Guardar y eliminar requieren una acción explícita del usuario. No hay extracción automática de conversaciones, diagnósticos ni perfilado de conducta. Los recuerdos son datos que el usuario declaró, no hechos independientes verificados.

En voz, la herramienta `remember_information` prepara solo un borrador si el turno transcrito contiene una petición explícita de recordar/guardar información. Un botón «Guardar recuerdo» confirma el contenido editable y termina la conversación; nunca escribe de forma autónoma. Por texto se guardan desde el editor de recuerdos del perfil o desde la acción local «Guardar un recuerdo · sin IA» en Balta → Escribir. Esta acción usa el comando confirmado sin consultar a OpenAI; las consultas de IA mantienen sus tres operaciones. Borrar o editar información se hace desde Perfil. No se añade otra clase de operación a la tabla de harness.

## Integración y límites

La unidad `lib/balta-profile.ts` define esquema, límites, comandos y contexto. El estado JSON del propietario añade `balta?`; no cambia tablas, RLS, biblioteca Supabase ni credenciales. Los comandos usan la ruta autenticada existente, revisión CAS e IDs idempotentes, sin afectar misiones, puntos o XP. El importador acepta respaldos anteriores y conserva el nuevo campo; la importación no puede sobrescribir un espacio con personalización configurada.

Los constructores de contexto agregan `personalization` únicamente si el usuario habilitó su uso. Los avisos de consentimiento incluyen el perfil y recuerdos habilitados. No se envía el nombre de la cuenta automáticamente: solo el apelativo que el usuario eligió en este perfil. Desactivar el uso conserva los datos pero los excluye de consultas nuevas; borrar elimina el registro del estado activo. Terminar una sesión evita que una conversación vieja continúe con contexto desactualizado; copias previas de respaldo pueden conservar lo exportado.

## Contratos para implementación

`BaltaProfile={preferredName:string;workingStyle:string;humor:'lively'|'subtle'|'serious';support:'balanced'|'gentle'|'direct';useInAssistant:boolean}`.

`BaltaMemory={id:string;text:string;created:number;updated:number}`; `BaltaPersonalization={profile:BaltaProfile;memories:BaltaMemory[]}`; `State.balta?:BaltaPersonalization`.

Exports: `getBalta(s)`, `baltaContext(s)` (null al deshabilitar), `baltaSchema` (valida capacidad y IDs únicos), `applyBalta(s,command,now)`. Comandos: `baltaProfile` con `profile`; `baltaRemember` con `text`, `memoryId?`, `confirmed:true`; `baltaForget` con `memoryId`, `confirmed:true`; `baltaForgetAll` con `confirmed:true`.

## Verificación

Regresiones de capacidad, duplicados, edición/borrado, confirmación, aislamiento por propietario, revisión concurrente, importación antigua y nueva, exclusión al deshabilitar, ausencia de identidad/economía/soportes en contexto y rechazo de instrucciones de memoria sin petición explícita. Navegador con datos ficticios: guardar perfil, crear/editar/borrar recuerdo, desactivar y revisar contextos capturados, móvil y teclado. No modificar los datos reales del usuario ni abrir IA pagada para la verificación. Suite, compilación, revisión y despliegue exacto en Render.
