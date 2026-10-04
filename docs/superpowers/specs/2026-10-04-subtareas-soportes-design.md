# Subtareas y soportes

Alcance aprobado por Jorge: Proyecto → tarea principal → subtareas, convertir tareas existentes sin reescribirlas, soportes privados opcionales y confirmar explícitamente el resultado antes de cerrar la tarea principal. La lista de Misiones mostrará primero tareas principales agrupadas por proyecto.

Una sola profundidad de subtareas. Cada subtarea conserva su identidad, descripción, tiempo, pasos y soportes. Hereda el área/proyecto de la principal. Las tareas completadas no se convierten ni se reabren: conservan historial y recompensas. Convertir no elimina sesiones, dependencias o archivos. Se impiden ciclos, conversiones de tareas con hijos y cambios mientras existe enfoque en la tarea afectada. Se puede separar una subtarea pendiente.

Las subtareas se completan sin puntos de misión ni victorias; el enfoque conserva su XP habitual. Completar todas no cierra automáticamente la principal. El cierre de una principal con subtareas exige que las activas estén completadas y una confirmación explícita del resultado. La recompensa se otorga una sola vez. Los pasos antiguos siguen funcionando y se muestran dentro del detalle.

Detalle de misión accesible también después de completarla: descripción, pasos, subtareas, conversión, edición y soportes. Agrupación desplegable por proyecto y bandeja Sin proyecto; búsqueda encuentra también títulos de subtareas. Ningún dato existente se reorganiza sin decisión del propietario.

Soportes: enlaces HTTPS/HTTP y archivos PDF, imágenes raster, texto y documentos Office hasta 8 MB, veinte archivos por misión. Bucket privado en Supabase Storage, acceso por sesión propietaria y ruta usuario/tarea. Descarga autenticada como archivo, sin URLs públicas; archivos no se envían a IA. El respaldo JSON conserva jerarquía y enlaces, pero no contiene binarios; documentación explicará respaldo independiente de Storage. Compatibilidad con respaldos v1 anteriores.

Verificación: conversión y ciclos, cierre explícito, recompensa única, subtareas sin premio, historial intacto, respaldo, permisos de Storage, formatos/tamaño, UI móvil y compilación. Implementación y despliegue autorizados por «Sí, procede».
