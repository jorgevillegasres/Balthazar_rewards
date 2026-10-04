# Proyecto en captura asistida

Diseño aprobado por el usuario: elegir Sin proyecto o un proyecto existente antes de consultar a Balthazar. La elección se aplica a todas las propuestas y puede ajustarse individualmente antes de guardar. Abrir captura desde un proyecto preselecciona ese proyecto.

El servidor valida que el proyecto exista antes de consultar a OpenAI. El contexto incluye la elección explícita y solo los proyectos necesarios. La asignación final respeta la elección incluso si la IA devuelve otro proyecto; para un proyecto seleccionado también se conserva su área. Cambiar la selección descarta propuestas anteriores. Solicitudes antiguas sin elección mantienen el comportamiento anterior.

No se modifican tareas existentes ni se requieren cambios de base de datos. Verificar selección, ausencia explícita de proyecto, proyectos desconocidos, compatibilidad y edición posterior.
