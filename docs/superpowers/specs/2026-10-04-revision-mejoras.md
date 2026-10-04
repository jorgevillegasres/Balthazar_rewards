# Revisión de Balthazar: ejecución con subtareas

Fecha: 2026-10-04. Código revisado: dc11855. Revisión de código y pruebas con datos ficticios; no se modificaron tareas reales ni se comprobó una carga desde la sesión del propietario.

## Evidencia

- `npm test`: 59 pruebas aprobadas, cero fallos.
- Reproducción de asistencia para empezar: crear principal e hija, convertir la hija y archivar la principal. El selector de rescate en Quest propone la hija INBOX; el dominio rechaza iniciarla con «La tarea principal no está disponible».
- Reproducción de contadores: una principal INBOX con dos hijas INBOX muestra tres pendientes en Today y uno en Missions.

## Correcciones prioritarias

1. Unificar la elegibilidad para las sugerencias de rescate con las reglas de inicio, incluyendo estado y dependencia del padre. Nunca ofrecer una acción que el servidor rechazará.
2. Contar tareas principales en el Inbox de Hoy; mostrar las subtareas como avance dentro de ellas. Aplicar la misma interpretación en todas las pantallas.
3. Mostrar el estado BLOQUEADA en la fila de Misiones y evitar ofrecer cierre o enfoque cuando no está permitido. Actualmente el enfoque se deshabilita, pero el cierre no tiene esa misma condición.

## Mejora recomendada: conectar Hoy con el siguiente paso

Conservar las tres misiones principales del día. En cada tarjeta, mostrar avance de subtareas y una acción disponible para empezar. Si hay varias subtareas disponibles, permitir elegir; si hay pasos pendientes en una subtarea, abrir su detalle. Si todas están completas, ofrecer revisar y confirmar el resultado principal. No abrir automáticamente otra sesión ni otorgar premios por subtareas.

El modo de enfoque debe identificar principal y subtarea, y volver al detalle de la principal al terminar la acción pequeña. Mantener selección diaria y victoria asociadas a principales. Las dependencias y los estados bloqueados se respetan tanto en la UI como en el servidor.

## Mejoras posteriores

- Detalle de misión con resumen inicial y secciones desplegables: subtareas, soportes y reorganización. Los formularios de enlaces y conversión no necesitan estar siempre abiertos.
- En el resumen, indicar si hay archivos además de enlaces. Actualmente Misiones muestra únicamente enlaces, porque los archivos viven en Storage y se consultan al abrir el detalle.
- Asistente que proponga subtareas editables dentro de una misión. Hoy su contrato genera pasos de texto; los nuevos cambios deben preservar subtareas existentes y pedir aceptación antes de guardar propuestas. No cambiar tareas completadas ni premios.
- Respaldo que incluya archivos mediante un flujo separado con manifiesto y restauración ensayada; el JSON actual no contiene binarios.

## Alternativas y orden

1. Correcciones más integración Hoy–subtareas: recomendada, resuelve inconsistencias y reduce navegación durante el trabajo diario.
2. Mejorar primero el detalle: reduce ruido visual, pero deja la ejecución diaria sin el siguiente paso.
3. Ampliar primero la IA: ayuda a descomponer, pero puede aumentar los pendientes si la navegación sigue fragmentada.

Orden recomendado: correcciones, integración de ejecución diaria, simplificación del detalle, propuestas de subtareas con IA, respaldo completo. Esto es una revisión y una propuesta; no constituye implementación ni publicación de nuevas funciones.
