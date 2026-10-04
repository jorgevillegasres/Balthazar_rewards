# Balthazar: conversación de voz fluida

Estado: alcance aprobado mediante «Procedamos». Cada conversación utiliza misiones y proyectos actuales, sin memoria persistente. Incluye activación opcional Hola Balta con reconocimiento local exclusivamente cuando el navegador lo admite; el botón de voz permanece disponible como alternativa.

## Experiencia propuesta

Botón Hablar con Balthazar en Hoy. Panel con estados Conectando, Escuchando, Respondiendo y Desconectado; controles Silenciar micrófono y Terminar. La conversación admite interrupciones y respuestas habladas en español. Un registro textual permite revisar lo entendido. Se mantiene la paleta actual.

## Primera versión

- Consultar las misiones disponibles, sus proyectos y dependencias para conversar sobre prioridades.
- Proponer hasta tres bloques que caben en el tiempo y la energía disponibles.
- Capturar pendientes con elección explícita de proyecto o Sin proyecto.
- Proponer subtareas para una misión existente, sin modificar pasos completados.
- Mostrar propuestas editables. Solo un botón de confirmación en la aplicación guarda cambios; la voz no confirma finalizaciones ni concede puntos.

No incluye calendario externo ni archivos adjuntos en el contexto. La alternativa inicial recomendada usa misiones y proyectos actuales sin conservar conversaciones entre sesiones. Si se elige memoria persistente, se definirá un resumen revisable como alcance adicional antes de implementar.

## Integración

OpenAI Realtime y WebRTC para el audio. Render autentica al propietario, valida origen, limita aperturas y configura las sesiones; la clave permanente permanece en el servidor. Supabase mantiene el estado actual. Las operaciones de la conversación son funciones limitadas de lectura o generación de propuestas; la escritura utiliza los comandos y controles de revisión existentes.

Antes de activar audio, informar que audio y contexto seleccionado se envían a OpenAI y pedir permiso de micrófono. Al cerrar, desconectar transporte, detener pistas de micrófono y reproducción. No guardar grabaciones en la aplicación. Presentar error recuperable si falla permiso, conexión o proveedor.

## Sesiones y consumo

Proponer un temporizador inicial de cinco minutos y un límite diario de aperturas configurable en servidor. Un temporizador del cliente no equivale a un límite monetario garantizado; comprobar controles de sesión del proveedor antes de prometer un techo de gasto. Definir y verificar una restricción operativa del servidor antes de publicar.

## Validación

Probar permisos de audio denegados, interrupciones, cierre y reconexión, propuestas inválidas y dependencias, cambios de revisión, duplicados, autenticación y límites. Verificar audio real en computador y teléfono con participación del usuario. Las pruebas simuladas de eventos no sustituyen la verificación del micrófono y reproducción reales.

## Fuentes oficiales consultadas

- https://developers.openai.com/api/docs/guides/voice-agents
- https://developers.openai.com/api/docs/guides/voice-webrtc
- https://developers.openai.com/api/docs/guides/realtime
- https://developers.openai.com/api/docs/guides/voice-server-controls
