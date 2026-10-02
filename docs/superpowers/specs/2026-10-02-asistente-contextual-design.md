# Balthazar: asistente contextual

Diseño propuesto para revisión. No representa una integración publicada ni activa.

## Objetivo

Reducir el esfuerzo para organizar pendientes, elegir una actividad y empezar una tarea. Mantener la consola personal y su paleta actual. La IA aconseja; Balthazar valida y el propietario decide.

## Primera versión

### Captura asistida

En Capturar → Brain Dump, añadir «Organizar con Balthazar», conservando la separación por reglas. El usuario escribe hasta 5.000 caracteres. Antes de la primera consulta se explica que el texto y las áreas/proyectos relevantes se enviarán al proveedor elegido.

El resultado contiene hasta diez borradores con título, área existente, proyecto existente o ninguno, duración estimada y siguiente acción. Cada borrador se puede editar y quitar. Las estimaciones se identifican como propuestas. Las fechas solo se incorporan cuando el texto las permite determinar; las ambigüedades se muestran como preguntas. El botón «Guardar tareas» confirma el lote mediante la orden de captura existente. La consulta no crea tareas por sí sola.

### Ayuda sobre una misión

Añadir «Ayúdame a empezar» a las misiones pendientes. El usuario puede indicar qué lo está bloqueando. La IA recibe la misión elegida, su proyecto y sus dependencias relevantes; propone una siguiente acción y hasta ocho pasos concretos.

Se puede empezar una sesión de cinco minutos sin modificar la tarea o revisar y guardar los pasos. La aplicación usa la revisión actual y la validación del dominio. No reemplaza automáticamente pasos con progreso ni modifica tareas completadas. Si existe trabajo previo en los pasos, solo se ofrece el consejo hasta que el usuario revise la edición manualmente.

### Orientación del día

En Hoy, un panel «Preparar mi día» pide minutos disponibles y energía. Propone hasta tres tareas existentes y explica su elección, considerando fechas, dependencias y duración. Solo incluye tareas que se pueden empezar. Permite iniciar una tarea desde la propuesta usando el flujo actual; no reemplaza el Daily Set automáticamente.

Si el tiempo disponible es menor que una tarea, distingue un bloque parcial del tiempo total estimado y no promete completar la tarea en ese bloque. Si no hay candidatos, ofrece capturar o desbloquear pendientes. No concede puntos por aceptar un consejo.

## Integración

Crear una ruta privada en Render para consultas. Verificar sesión y propietario, origen público, tipo y tamaño de solicitud. El servidor consulta Supabase y construye el contexto; no acepta del navegador un estado arbitrario como fuente de verdad.

La clave del proveedor se guarda como secreto de Render, nunca en el navegador ni GitHub. El propietario eligió OpenAI API. El modelo se configurará en el servidor y se seleccionará mediante una evaluación de calidad y coste antes de activar llamadas. Mantener la lógica de contexto y validación separada de ese adaptador.

Exigir una salida estructurada por función y validar límites, IDs, áreas y tareas elegibles después de la respuesta. El modelo no recibe SQL, credenciales, funciones de canje, órdenes de completar tareas ni acceso general a la base. Los textos de tareas son datos, no instrucciones con autoridad sobre el sistema.

## Privacidad y consumo

Enviar únicamente el contexto seleccionado para cada función. Excluir correo, saldos, recompensas y descripción de tareas ajenas al contexto. No almacenar conversaciones completas ni contenidos de solicitudes en registros. Los consejos permanecen en la vista; las tareas y pasos aceptados sí se guardan en el estado habitual y se incluyen en el respaldo.

Antes de habilitar el proveedor externo, mostrar qué información se enviará y requerir aceptación del propietario. Explicar que alojar los datos en Supabase no evita el procesamiento externo del contexto enviado a la IA.

Proponer un límite inicial de veinte consultas por día por propietario, con reserva atómica persistente antes de contactar al proveedor para evitar carreras entre dispositivos. Además, fijar límites de entrada/salida, un tiempo de espera de treinta segundos y no reintentar automáticamente una llamada costosa. El límite de consultas no equivale a un presupuesto monetario; configurar también el presupuesto/alertas que permita el proveedor seleccionado.

## Errores y coherencia

La falta de clave, un límite alcanzado, una respuesta inválida o una interrupción producen mensajes claros sin modificar datos. Las funciones manuales permanecen disponibles. Una propuesta generada con una revisión anterior no se aplica sin volver a revisar los datos actuales. No marcar como IA un resultado de reglas.

## Verificación

- Comprobar minimización de contexto y exclusión de datos personales innecesarios.
- Rechazar identificadores inventados, dependencias incumplidas y salidas fuera de límites.
- Verificar sesión, origen, cuota concurrente, ausencia de clave y tiempo de espera.
- Comprobar que consultar y rechazar consejos no cambia el estado ni los puntos.
- Comprobar captura confirmada, conservación de pasos avanzados y conflictos de revisión.
- Revisar consola en teléfono y computador, navegación por teclado y avisos accesibles.
- Ejecutar pruebas y compilación antes de publicar; probar una consulta real solo tras configurar el proveedor y aceptar el envío de contexto.

## Evolución posterior

Memoria editable de preferencias, revisión semanal, objetivos a largo plazo, voz, integraciones externas y ejecución autónoma se diseñarán después de evaluar esta primera versión. No se añaden en este alcance.

## Criterio de utilidad

Evaluar con el propietario si las propuestas facilitan iniciar una sesión, reducen el esfuerzo de captura y requieren pocas correcciones. No inferir diagnósticos ni hábitos a partir de datos insuficientes. La calidad se valora con uso real, no solo con pruebas técnicas.
