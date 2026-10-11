# Balthazar

Espacio personal de misiones, enfoque y recompensas. PWA privada con Next.js, Render y Supabase. No requiere ChatGPT para iniciar sesión ni guardar datos.

## Desarrollo

Node 22.13 o superior. `npm ci`, copiar `.env.example` a `.env.local`, completar configuración y ejecutar `npm run dev`. `npm test`, `npm run typecheck` y `npm run build` verifican la aplicación. `npm start` escucha en `0.0.0.0` y utiliza `PORT`.

## Acceso

Configurar `BALTHAZAR_OWNER_EMAIL` y el mismo correo en `balthazar_allowed_emails`. El servidor verifica la sesión con Supabase Auth. PostgreSQL aplica RLS por identidad y propietario. No se utilizan claves administrativas en la aplicación ni se aceptan cabeceras de autenticación de ChatGPT.

Antes del primer acceso, configurar las plantillas **Confirm signup** y **Magic Link** de Supabase Auth para incluir `{{ .Token }}`. Balthazar permite crear acceso con contraseña y confirmar mediante código. Recuperación: solicitar código por correo e introducirlo en la pantalla de acceso. No es necesario configurar un proveedor OAuth. Usar SMTP propio cuando las limitaciones del correo de desarrollo no sean suficientes.

## Despliegue y datos

Render ejecuta `npm ci && npm run build` y `npm start`; `/api/health` comprueba el proceso. El archivo `render.yaml` reproduce la configuración. Las claves publishable son públicas por diseño; nunca colocar secret/service_role en NEXT_PUBLIC ni en Git.

`npm run build` ejecuta las pruebas de dominio y respaldo antes de compilar; Next.js también comprueba TypeScript. GitHub Actions reproduce estas comprobaciones cuando la cuenta permite ejecutar sus runners. Una restricción de GitHub Actions no elimina las verificaciones ejecutadas por Render.

El estado se conserva en JSONB por usuario para trasladar sin alterar reglas existentes. Una actualización atómica condicionada por revisión evita sobrescrituras concurrentes. Las órdenes conservan sus identificadores para evitar cobros o capturas repetidos.

En Perfil se descarga un respaldo JSON versionado, que puede importarse únicamente en un espacio sin actividad. Los respaldos contienen información personal: almacenarlos cifrados fuera de Render y del repositorio. La base de datos persiste en Supabase y no depende del disco efímero de Render. El respaldo manual de Perfil no sustituye una política automatizada de respaldo; habilitar recuperación/backup según el plan de Supabase y ensayar restauración en un proyecto separado.

La PWA requiere conexión. No almacena datos privados en el service worker. Render Free puede suspender el proceso por inactividad; el primer acceso puede tardar. El temporizador se calcula mediante marcas de tiempo y no depende de que el proceso permanezca activo.

Las fuentes Barlow Condensed, DM Sans e IBM Plex Mono se sirven desde `/fonts` con sus licencias. La aplicación no solicita fuentes a Google durante el uso.

## Asistencia contextual

En Hoy → Preparar mi día, Balthazar propone hasta tres tareas disponibles según minutos y energía. En una misión → Ayúdame a empezar, propone una siguiente acción y hasta ocho pasos; guardarlos requiere confirmación y no reemplaza pasos ya avanzados. En Capturar → Con Balthazar, el texto se convierte en hasta diez borradores editables. Las fechas explícitas en formato YYYY-MM-DD se conservan; otras expresiones requieren revisión. Ninguna consulta completa misiones ni concede puntos. Iniciar cinco minutos usa el temporizador habitual, no consume automáticamente el bloque sugerido del plan.

Configurar `OPENAI_API_KEY` solo en Render y `OPENAI_MODEL` si se cambia el modelo. Valor inicial: `gpt-5-mini-2025-08-07`; verificar disponibilidad de la cuenta y evaluar calidad con uso real. La API requiere facturación propia. Sin clave, las consultas muestran un aviso y el resto de la aplicación sigue funcionando. No guardar claves en Git ni usar NEXT_PUBLIC para secretos.

La ruta `/api/assistant` requiere sesión y consentimiento. Envía a OpenAI el contexto mínimo de la función elegida, excluyendo identidad, economía e historial. Usa Responses API con `store:false`, salida estructurada, 2.800 tokens máximos de salida y treinta segundos de espera, sin reintentos automáticos. `store:false` no implica ausencia de toda retención por parte del proveedor: revisar sus controles de datos antes de enviar información sensible. No se persisten conversaciones completas ni se registran los textos enviados. Los pasos y tareas aceptados quedan incluidos en el respaldo normal.

La cuota es de veinte consultas por día de Bogotá, compartida por todos los dispositivos y reservada atómicamente en Supabase antes de contactar al proveedor. Un intento reservado cuenta incluso si el proveedor falla. Las reservas contienen usuario y fecha, no contenido de tareas. La cuota limita solicitudes, no dinero: configurar también límites/alertas de gasto en OpenAI. La aplicación no dispone de SQL, canjes o herramientas autónomas para el modelo.

La verificación automatizada cubre validación del contexto, referencias, fechas, tiempo disponible, progreso existente y transporte del proveedor simulado. La comprobación real del modelo requiere clave, facturación y una consulta consentida. Las pruebas visuales locales utilizan datos simulados; no son prueba de calidad del modelo real.

## Conversación con Balta

Hoy → Hablar con Balthazar abre una conversación fluida en español por WebRTC. Requiere micrófono, conexión y consentimiento para enviar voz y contexto actual a OpenAI. Puede proponer un plan, capturar misiones con o sin proyecto y dividir una principal en subtareas. Los borradores se revisan y editan en pantalla; solo Guardar/Aplicar cambia el estado. No completa misiones ni concede recompensas. Conserva las misiones completadas en sus posiciones del día.

La clave existente `OPENAI_API_KEY` se usa exclusivamente en el servidor. `OPENAI_REALTIME_MODEL` es opcional; el valor inicial es `gpt-realtime-2.1`. Una apertura y cada propuesta consumen una reserva de la cuota diaria compartida. Se limita cada sesión a cinco minutos mediante cierre del cliente y temporizador del servidor; los reinicios y fallos de red/proveedor impiden garantizar un límite monetario estricto. No se persiste audio ni conversación en Balthazar. Los controles de retención del proveedor son independientes.

«Hola Balta» es optativo: requiere panel abierto y visible y reconocimiento local en español compatible con `SpeechRecognition.processLocally`. Si el navegador permite descargar su paquete local, se ofrece un botón para prepararlo. No se sustituye por reconocimiento remoto. Donde no esté disponible se usa el botón de conversación. Ocultar la aplicación o salir detiene las pistas del micrófono y la escucha; no funciona con la pantalla bloqueada ni con la aplicación cerrada.

Las pruebas automatizadas y la interfaz usan transporte y audio simulados. La aceptación con micrófono, reproducción real de OpenAI y navegador móvil requiere una sesión del propietario.

## Migración desde Sites

Usar el exportador de la instalación anterior autenticado como propietario, descargar el JSON e importarlo en esta instalación después de crear el acceso. No copiar datos de pruebas locales. Mantener la instalación anterior hasta verificar tareas, saldo, historial y foco desde teléfono y computador. La instalación como PWA debe repetirse para el nuevo dominio.

## Subtareas y soportes

Misiones muestra tareas principales agrupadas por proyecto. Abre una tarea para añadir subtareas o convertir tareas pendientes existentes, conservando sus IDs, sesiones y soportes. Se usa un solo nivel de subtareas, con el área y proyecto de la principal. Las tareas completadas mantienen su historial. Puedes separar una subtarea pendiente y corregir una casilla marcada antes de confirmar el resultado principal.

Las subtareas no conceden puntos ni XP de misión ni cuentan como victorias diarias; el enfoque conserva su XP habitual. El cierre de la principal exige completar pasos y subtareas activas y confirmar el resultado. Los hijos archivados no bloquean el cierre, pero tampoco eliminan la confirmación. La revisión muestra el tiempo acumulado de la principal y las subtareas completadas; puede corregirse antes de guardar. No se reorganizan familias durante su enfoque activo. Archivar la principal termina la sesión de enfoque de su subtarea, registrando el tiempo.

En el detalle y la confirmación puedes añadir enlaces HTTP/HTTPS y archivos PDF, PNG, JPG, WEBP, TXT, DOCX, XLSX o PPTX hasta 8 MB. La aplicación limita veinte archivos y veinte enlaces por tarea. El bucket `balthazar-supports` es privado; sus políticas requieren sesión propietaria, correo permitido y una tarea existente. No se usan claves administrativas. La descarga se sirve como adjunto autenticado y no se envían soportes a OpenAI. La extensión y MIME declarado se validan; no se realiza análisis antivirus ni interpretación automática de documentos.

Aplicar `supabase/migrations/20261004054200_balthazar_private_supports.sql` al reproducir la infraestructura. El límite de veinte archivos se comprueba antes/después de subir y se compensa el exceso; un propietario autorizado que use Storage directamente puede superar ese contador de la aplicación. El tamaño, tipos MIME y privacidad se aplican también en Storage. Las eliminaciones de archivos requieren confirmación en la interfaz.

El respaldo JSON v1 conserva la jerarquía y los enlaces y acepta respaldos anteriores. **No incluye los archivos binarios de Storage.** Descárgalos desde los soportes y respalda el bucket por separado antes de migrar de proyecto o cuenta. Restaurar JSON no traslada esos archivos. Las tareas convertidas conservan su carpeta de archivos porque su ID no cambia.

## Ejecución desde Hoy

Las tarjetas de Hoy muestran el avance de subtareas y permiten elegir una acción disponible respetando dependencias y estados de la principal. Los pasos pendientes de una subtarea pueden revisarse desde su detalle; el arranque de cinco minutos sigue siendo una elección explícita. Tras confirmar una subtarea desde enfoque, se vuelve al detalle de la principal. Completar todas las acciones ofrece revisar el resultado, sin cerrar automáticamente la misión ni duplicar recompensas. El contador de Inbox cuenta principales. La asistencia para empezar ofrece retomar la sesión si queda una abierta.

## Centro de control personal

Hoy incluye Centro de mando con principales vencidas, bloqueadas y por organizar. Propósitos permite definir resultados y vincular proyectos, con confirmación del vínculo. El indicador cuenta principales completadas frente a las activas y completadas; no declara automáticamente terminado un propósito. Archivar un propósito conserva sus proyectos y tareas.

«Escribir a Balta» y la voz usan el ejecutor `/api/harness`. En texto se elige captura, plan o subtareas y las referencias en selectores; «Resumir proyecto» es lectura local sin IA ni cuota. Autonomía interna está activada inicialmente y puede cambiarse a revisar propuestas. Solo una instrucción explícita, completa y validada permite guardar; preguntas, negaciones, condiciones, fechas relativas y preguntas esenciales de la propuesta quedan para revisión. La voz exige nombrar claramente el proyecto o la tarea, o indicar «sin proyecto». El modelo no decide permisos. Tras una escritura por voz se cierra la conversación para actualizar su contexto.

Las entradas anteriores de captura asistida pasan por el mismo ejecutor en modo revisión. Las propuestas editadas y los vínculos confirmados generan un comprobante de actividad. Ninguna herramienta completa misiones, canjea recompensas, ejecuta SQL o contacta servicios externos. Los errores de conexión ofrecen comprobar el mismo ID antes de volver a ejecutar; los reintentos conservan la solicitud original.

Actividad muestra ejecuciones, propuestas pendientes, fallos y acciones deshechas. Deshacer creación archiva únicamente pendientes intactos. Las sesiones, avance, relaciones o intentos de adjuntar soportes bloquean la reversión; los archivos privados se comprueban en Storage antes de deshacer. La carga reserva una revisión del estado antes de escribir el archivo, evitando competir con una reversión. Un intento de carga fallido también protege la tarea de esta reversión automática; se puede revisar manualmente.

El estado conserva los 200 comprobantes recientes. Las propuestas/fallos están en `balthazar_operations`, privada con RLS por propietario y correo permitido. La vista y el exportador consultan los últimos 90 días; el exportador avisa si supera 10.000 registros. No hay borrado programado de registros. El JSON de respaldo conserva propósitos, vínculos y comprobantes; las operaciones separadas se descargan desde Actividad, y los archivos requieren respaldo independiente de Storage.

Aplicar las migraciones `20261011005518_balthazar_operations.sql` y `20261011010125_balthazar_operation_undo_status.sql` al reproducir la infraestructura. Se mantiene la cuota de veinte consultas/aperturas por día. La asistencia funciona con datos actuales y no guarda memoria de conversaciones entre sesiones. La verificación de interfaz usa proveedor y datos ficticios; la aceptación del modelo y audio reales se hace con una sesión consentida del propietario.

## Edición del avance

Los pasos completados se muestran protegidos en el editor. Solo se editan los pendientes; el servidor rechaza cambiar, reordenar o eliminar el prefijo ya completado. No se recalcula ni se corrige automáticamente el historial existente. Guardar o cancelar una edición vuelve al detalle de esa misma tarea. En Hoy, las misiones completadas muestran minutos reales y puntos concedidos; las pendientes conservan su estimación.
