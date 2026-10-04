# Prueba de uso de Balthazar

Fecha: 2026-10-04. Versión del código: 2b13cfa. Objetivo: descubrir problemas usando la interfaz, no solo leyendo el código.

## Alcance y límites

Se abrió la instalación online; apareció la pantalla de arranque de Render y luego el acceso de Balthazar. No había sesión autenticada. El recorrido de escritura se realizó con los componentes actuales de Quest en una ruta local temporal, con estado ficticio en memoria y las mismas mutaciones del dominio. La ruta temporal fue retirada al terminar.

No se modificó el progreso real. No se verificaron persistencia entre dispositivos, subida/descarga real en Supabase ni respuestas reales de OpenAI. Storage y el proveedor IA se desactivaron en el recorrido local. El soporte por enlace sí se guardó en el estado ficticio.

## Recorrido realizado

1. Crear el proyecto «QA · Curso de datos», área Docencia y descripción de resultado.
2. Crear «QA · Preparar clase de visualización», asociada al proyecto, estimada en 60 minutos.
3. Añadir dos subtareas; comprobar que el Inbox mantiene una sola tarea principal.
4. Editar una subtarea: duración 25 minutos y dos pasos.
5. Marcar un paso y editar la lista insertando un paso nuevo al comienzo.
6. Añadir un enlace de material ficticio a la subtarea.
7. Iniciar enfoque, cerrar la subtarea y comprobar retorno a la principal con avance 1/2 y sin puntos de misión.
8. Completar la otra subtarea; preparar misiones desde Hoy.
9. Intentar cerrar sin marcar confirmación: el formulario permanece abierto, sin recompensa.
10. Confirmar el resultado: principal completada, 20 puntos y victoria diaria en este escenario ficticio.

La consola del navegador no registró avisos ni errores durante la comprobación final.

## Hallazgos reproducidos y propuestas

### P1: editar pasos cambia el significado del avance

Antes: «Elegir conjunto de datos» completado; «Redactar ejercicio» pendiente. Después de insertar «Validar requisitos nuevos» al comienzo, ese paso nuevo aparece completado y «Elegir conjunto de datos» pendiente. Se confirmó también mediante las mutaciones del dominio: stepsDone sigue en 1, asociado a la posición y no al paso original.

Propuesta inicial compatible: proteger el prefijo de pasos completados y permitir editar solo los pendientes; una modificación del progreso debe ser explícita. Una alternativa mayor es asignar identificadores a cada paso, con migración de respaldos y estado. Priorizar evitar completados inventados antes de añadir capacidades nuevas.

### P2: guardar una edición pierde contexto

Al abrir la subtarea desde su principal, editar duración/pasos y guardar, se cierra el editor y se vuelve a Misiones. Es necesario abrir de nuevo la principal y la subtarea para seguir.

Propuesta: guardar o cancelar debe regresar al detalle de la tarea editada, conservando el acceso a su principal. No cambiar automáticamente proyecto/pestaña de navegación.

### P2: formularios extensos para acciones pequeñas

Toda subtarea nueva se crea con 10 minutos; cambiarlo exige el editor completo. El detalle muestra siempre formularios de enlaces y archivos, incluso sin soportes. El cierre vuelve a presentar esos mismos formularios antes de la confirmación.

Propuesta: título y minutos al añadir subtarea; detalles avanzados opcionales. Soportes desplegables con contador; en el cierre, mostrar resumen y acción «Añadir soporte».

### P2: recompensa mostrada después del cierre sigue siendo estimada

La tarjeta completada conservó «60 min» y «+70 pts estimados», pero el cierre guardó 11 minutos reales y concedió 20 puntos. No es un fallo del cálculo: el texto de la tarjeta conserva la estimación previa.

Propuesta: una misión completada debe mostrar tiempo real y puntos efectivamente concedidos. Mostrar por separado la estimación solo si resulta útil.

### P3: mensajes de Hoy no se ajustan siempre al estado

Con una misión existente aún en Inbox, la tarjeta vacía ofrece «Capturar mi primera tarea». Con subtareas ya terminadas, la consola sigue diciendo «Empieza por una sola acción» y el texto de siguiente acción conserva «Definir objetivos de la clase».

Propuesta: si hay pendientes, ofrecer preparar las misiones; si el resultado está listo, invitar a revisarlo y confirmarlo. La siguiente acción debe reflejar el avance actual.

## Orden recomendado

Primero proteger el avance al editar pasos. Después mejorar continuidad de edición y claridad de recompensa real. Finalmente reducir campos visibles y adaptar los mensajes al estado. Esto es un informe de prueba y propuesta; no se publicaron cambios de funcionalidades en este recorrido.
