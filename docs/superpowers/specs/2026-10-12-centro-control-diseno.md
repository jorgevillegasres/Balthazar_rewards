# Centro de control personal — diseño aprobado

El usuario aprobó mediante «Procede» la propuesta local `outputs/theme-review-20261012/balthazar-propuesta.html` del directorio padre. Dirección: centro de control personal, con misiones claras y Balta a un lado. La fuente Metronic 9.5.0 se revisó para patrones de composición; esta entrega implementa componentes y estilos propios sobre Balthazar.

## Experiencia

- Cabecera compacta con identidad, Capturar, acceso a Misiones/búsqueda y perfil. Navegación lateral agrupada por espacio, ritmo y cuenta. Móvil conserva Hoy/Misiones/Balta/Rutinas/Más.
- Panel de Balta visible en escritorio, con Hablar, Escribir, Organizar mi día, Dividir misión y Guardar un recuerdo. Todas las acciones abren los diálogos y flujos existentes. En móvil se utiliza el acceso de navegación y diálogo; no ocupa espacio fijo adicional sobre las tareas.
- Hoy: prioridad destacada con siguiente acción y subtareas, rápida/progreso en filas compactas desplegables, rutinas y atención con menor peso visual. Se mantienen progreso diario, desafíos, recompensa, escudos, cierre del día, reemplazo de misión, arranque corto y rescate.
- Misiones: se mantiene Vista general y las vistas y filtros existentes. Padres con subtareas pueden desplegar su lista sin abrir otro proyecto. La opción de mostrar subtareas individualmente sigue disponible; evitar duplicarlas al activar esa vista. Expansiones, filtros y proyecto seleccionado sobreviven a entrar/salir de enfoque y se aíslan por cuenta.
- Todos los indicadores, títulos, proyectos, bloqueos y progreso se calculan con estado real. Una subtarea no concede puntos de misión; un resultado principal no se confirma mediante desplegar o navegar.
- Paleta y fuentes preservadas: negro/violeta/lima/ámbar, Barlow Condensed/DM Sans/IBM Plex Mono. Superficies de lectura más claras, radios moderados, controles táctiles de al menos 44px, texto auxiliar al menos 12px, foco visible y movimiento reducido.

## Alcance

No nuevas APIs, autenticación, datos, tablas, memoria, conversaciones persistentes, modelos ni permisos de IA. No incorporar mocks, auth/Prisma o dependencias generales del paquete. No añadir arrastre para cerrar misiones ni mostrar funciones del theme que aún no existen. El panel de Balta es un acceso al asistente real, no un nuevo chat de texto libre.

El detalle de misión mantiene sus diálogos actuales en esta entrega, con estilo consistente; un cambio completo a panel lateral queda fuera para preservar foco, soportes y revisiones ya verificadas.

## Validación

Pruebas de estado de expansión antes de implementación; suite completa y build. Revisión independiente de requisitos y código. Browser QA con estado/transporte ficticios: navegación y dock, inicio/cierre de enfoque y filtros/expansión, padre/subtareas/bloqueos, captura/edit/resultados, recuerdos, Profile/rutinas/proyectos, voz sin proveedor, tamaños 360/768/1440 y teclado. Retirar fixtures antes de publicar; confirmar GitHub y Render del commit funcional.
