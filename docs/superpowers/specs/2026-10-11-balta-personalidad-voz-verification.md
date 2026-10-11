# Verificación: voz y personalidad de Balta

Commit funcional: `e509a42bb84a1c3b6fe0701976bf01487a5fa606`.

## Resultado

`cedar` sustituye a `marin` en nuevas sesiones de voz. Las instrucciones piden español natural, registro masculino medio-grave, entonación expresiva y pausas. La identidad compartida define a Balta como un estratega cómplice: sereno, cercano, satírico, sarcástico, histriónico, divertido y tierno según el contexto. El usuario puede pedir seriedad; el humor no se dirige a su dignidad ni introduce culpa. Las respuestas conducen a una acción concreta sin imponer decisiones.

Los tres modos de asistencia de texto y Realtime reciben la misma personalidad. En JSON se concentra el humor en el resumen para conservar títulos y acciones claros. No se cambiaron modelos, herramientas, permisos, cuotas, memoria, contexto enviado o controles de guardado.

## Pruebas

- Tres regresiones nuevas fallaron antes de implementar: voz anterior, entrega sin personalidad y ausencia de identidad compartida entre canales.
- Los transportes ficticios capturan las solicitudes construidas por `openVoice` y `askOpenAI`: voz `cedar`, personalidad compartida en capture/task/day, entrega diferenciada, interrupciones, límites, esquemas strict, store=false y ausencia de clave en los cuerpos.
- Pruebas específicas: 26/26. Suite completa: **213/213**.
- `npm run build`: salida 0; TypeScript y Next correctos.
- Revisión independiente aprobada, sin hallazgos de regresión.
- No llamadas pagadas a OpenAI ni audio/transcripciones de la cuenta real.

## Publicación

GitHub main actualizado. Render confirmó **live** para `dep-db60j2navr4c73fioh80` del commit funcional el 11 de octubre a las 22:12:56 UTC (17:12:56, Bogotá).

Comprobaciones públicas posteriores: salud y login 200; estado privado sin sesión 401; apertura de voz sin sesión 401; escritura sin Origin 403. La prueba de voz no abrió una sesión de OpenAI ni consumió una consulta. El cierre documental se publica con `[skip render]`.

## Escucha y ajuste con el propietario

La verificación de solicitudes no mide la percepción acústica ni garantiza cada respuesta del modelo. Terminar una conversación anterior y abrir una nueva después del despliegue para escuchar la voz. Evaluar en teléfono y computador:

1. «Tengo demasiados pendientes; ayúdame a elegir uno»: humor breve y siguiente paso útil.
2. «Hoy estoy cansado y frustrado»: tono tierno y carga realista, sin sarcasmo sobre la persona.
3. «Quiero que seas serio y directo»: respuesta seria sin teatralidad.
4. «Organiza mi día»: claridad de tiempo, energía, dependencias y herramientas actuales.

Estos ejemplos son un protocolo pendiente de prueba real, no un registro de respuestas observadas. Las voces e instrucciones se configuran desde `lib/balta-personality.ts`; no se añadió un editor de preferencias a la interfaz.
