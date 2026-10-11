# Balthazar — Organización integral de la interfaz

Estado: aprobado por el propietario con «aprobado». Implementación y verificación en curso.

## Objetivo

Conservar la consola personal inspirada en Evangelion y ordenar las funciones existentes para que Jorge encuentre su siguiente acción, dialogue con Balta y consulte sus proyectos sin recorrer un panel interminable. El trabajo comprende presentación, navegación y accesibilidad; no agrega capacidades de IA, integraciones ni reglas de progreso.

## Alcance de la revisión

Revisados: composición de Quest, Hoy, consola personal, centro de mando, Misiones/Proyectos, Propósitos, Rutinas, Recompensas, Perfil, Actividad, Captura, detalle de misión, Enfoque, diálogos, accesos de texto/voz, login y las dos hojas de estilos.

Inspección pública de entrada y login en escritorio y 390×844. Navegación móvil: siete controles de aproximadamente 54 px de ancho, con etiquetas largas en ese espacio. No hay sesión autenticada en el navegador de revisión; las observaciones del espacio privado proceden del código y la QA ficticia anterior, no de una nueva inspección de datos personales.

## Hallazgos

| Prioridad | Situación actual | Ajuste concreto |
|---|---|---|
| Alta | Hoy renderiza entradas de texto, voz y planificación, consola, centro de mando, rutinas y luego misiones | Mostrar las misiones inmediatamente después de un encabezado compacto; llevar contexto ampliado a secciones secundarias |
| Alta | Las prioridades aparecen en ControlCenter y Today | Mostrar una sola representación interactiva de las tres misiones del día |
| Alta | Escribir a Balta, Entrada de Balta, asistencia contextual y acceso de voz compiten | Un acceso global «Balta», con opciones claras de texto, organizar el día y voz; conservar ayudas contextuales junto a la tarea |
| Alta | Siete opciones primarias en el teléfono | Cinco controles: Hoy, Misiones, Balta, Rutinas y Más; ninguna función desaparece |
| Media | Rutinas tiene un administrador dentro de un diálogo mientras otras funciones tienen pantallas | Una pantalla propia de Rutinas; Hoy conserva solo sus acciones vigentes |
| Media | El panel incluye todas las tarjetas de propósitos y hasta ocho alertas antes de las misiones | En Hoy, resumen de atención con tres elementos y enlace al resto; propósitos en su pantalla |
| Media | Perfil mezcla identidad, estadísticas, insignias, configuración, respaldos y todos los cierres | Subvistas «Resumen», «Historial» y «Configuración», conservando contenidos |
| Media | globals.css define un sistema redondeado y console.css lo sobrescribe con consola angular | Una fuente de tokens y reglas compartidas; módulos con selectores acotados, sin cadena creciente de sobrescrituras |
| Media | Diálogo genérico no establece un nombre accesible explícito mediante su encabezado | Vincular dialog y título; mantener Escape, foco y cierre seguro; encabezado accesible en formularios largos |
| Media | Actividad expone identificadores técnicos en cada tarjeta | Detalles técnicos desplegables; fecha, acción, estado y revisión como información principal |

## Alternativas consideradas

1. **Consola personal organizada — recomendada.** Reorganizar funciones actuales y unificar controles. Mantiene la identidad aprobada y reduce la carga de navegación; requiere ajustes de componentes y QA transversal.
2. **Pulido conservador.** Solo espaciado, tamaños y estilos. Menor cambio, pero conserva duplicaciones y el recorrido largo de Hoy.
3. **Rediseño completo con paneles libres.** Ventanas, arrastre y disposición personalizada. Añade complejidad y comportamiento nuevo; queda fuera de esta actualización.

## Diseño recomendado

### Navegación

Escritorio (desde 1100 px): barra lateral estable con Hoy, Misiones, Proyectos, Propósitos, Rutinas y Recompensas; Actividad y Perfil/Configuración en el grupo secundario. El área principal conserva una cabecera con sección actual, «Capturar» y «Balta». Proyectos reutiliza el flujo existente y sus datos, sin nueva entidad.

Móvil y tablet: barra inferior de cinco controles sin desplazamiento horizontal: Hoy, Misiones, Balta, Rutinas, Más. Balta abre el panel del asistente. Más presenta Proyectos, Propósitos, Recompensas, Actividad y Perfil con nombres completos. Capturar permanece visible en la cabecera. Las vistas y selección de proyecto deben conservar el contexto al abrir y cerrar diálogos.

### Hoy

Orden: encabezado con fecha/hora discretas y energía; misiones del día (principal y dos complementarias); rutinas vigentes; requiere atención (hasta tres entradas y acceso a Misiones); resumen de progreso y recompensa objetivo; cerrar el día. Si hay sesión activa, retomar enfoque aparece antes de las misiones. No crear otra tarjeta de prioridades. En escritorio se permite una columna auxiliar para resúmenes; en móvil la prioridad precede a las métricas.

La marca hexagonal, una franja de estado y el reloj siguen dando carácter de consola. La identificación completa del usuario reside en Perfil; evitar la tarjeta grande repetida en Hoy.

### Misiones, Proyectos y Propósitos

Misiones conserva grupos por proyecto, búsqueda de tareas y subtareas, Inbox, completadas y archivadas. «Todas» se rotula «Activas» para describir su filtro real. Filtros compactos pero visibles; estados y fechas legibles sin depender del color. Proyectos tiene acceso directo que reutiliza su vista actual y permite volver a la lista de proyectos desde un detalle. Propósitos conserva resultados, progreso y vínculos; administración de vínculos se despliega a petición.

### Rutinas y recompensas

Rutinas muestra Hoy, calendario semanal, gestión y registro, usando los mismos comandos y límites. El editor mantiene vista previa de carga y los paquetes conservan selección/adaptación antes de incorporarlos. Recompensas reúne saldo y meta en un encabezado, catálogo y creación como herramientas secundarias; historial de canjes separado y desplegable. El descanso y cuidado básico no se presentan como privilegios que deban ganarse.

### Balta, formularios y detalle

Un acceso global y nombres consistentes «Escribir», «Organizar mi día» y «Hablar». Reutilizar ControlDialog y VoiceDialog, sin una conexión automática ni nuevo envío de información. Mantener consentimiento explícito, propuesta revisable y confirmación antes de guardar. Captura conserva una tarea, captura múltiple («Varias tareas», en lugar de Brain Dump) y asistencia. Proyecto visible antes de detalles avanzados.

Detalle de misión: título/contexto, siguiente acción, acciones principales, subtareas/pasos, soportes y opciones avanzadas. No ocultar dependencias ni avance completado. Formularios largos tienen pie de acciones accesible, errores próximos al campo y una sola acción primaria. Mantener navegación a principal desde subtarea y regreso al detalle tras editar.

### Perfil, Actividad y acceso

Perfil: Resumen (avance/insignias), Historial (cierres), Configuración (nombre/áreas/instalación/respaldo/sesión). Actividad mantiene revisión y deshacer, con IDs/códigos bajo «Detalles». Login conserva contraseña y código; no alterar recuperación ni restricciones de propietario. La entrada sin sesión no muestra menús que aparenten acceso al espacio privado.

## Sistema visual

Colores existentes: fondo #0B0A0F, violeta #60579E, ciruela #55265F, lima #A4D957, ámbar #F8BC25, texto #F4F1FA. No sustituir la paleta. Lima: acción principal y avance; violeta: selección/estructura; ámbar: advertencias o recompensa; estados también escritos.

Tipografía local: Barlow Condensed para títulos cortos, DM Sans para lectura/formularios, IBM Plex Mono para fecha/hora y datos breves. Reservar mayúsculas para etiquetas de consola, no párrafos. Escala de espacio 4/8/12/16/24/32; controles táctiles al menos 44×44 px; radios 2–4 px; bordes discretos. Cuerpo 16 px y texto auxiliar no menor de 12 px. Tarjetas con jerarquía por función, no todas con igual contraste. No agregar animaciones decorativas; respetar movimiento reducido.

## Invariantes

Mismos comandos, CAS, autenticación y propiedad. Ninguna migración ni modificación automática de datos. No cambiar puntos, XP, rachas, cuotas, confirmaciones de resultado, comportamiento de audio ni retención. No incorporar paquetes automáticamente. No añadir memoria ni enviar información extra al proveedor.

## Ejecución y validación tras aprobación

1. Extraer estructura de navegación y acceso global a Balta de Quest sin alterar su estado, modales o acciones.
2. Reordenar Hoy, eliminar duplicación de prioridades y hacer explícitas las entradas de secciones.
3. Integrar acceso directo a Proyectos/Rutinas; organizar Perfil, Actividad y herramientas de cada pantalla.
4. Unificar tokens y estilos de controles, formularios, tablas/listas y diálogos; corregir nombre accesible del diálogo.
5. Verificar con datos ficticios: navegación completa, proyecto→misión→subtarea→edición→detalle, rutinas, recompensas, aprobación/deshacer de propuesta y Enfoque. Verificar login sin enviar credenciales.
6. Probar 360, 390, 768 y 1440 px; títulos largos, muchos proyectos/rutinas, vacíos, errores y carga. Comprobar teclado, foco, 200% de zoom, movimiento reducido y ausencia de contenido detrás de la barra inferior.
7. Ejecutar pruebas existentes y build. Crear pruebas funcionales únicamente para cambios de navegación/estado que puedan causar regresiones; no tests que repitan reglas CSS.
8. Revisar capturas finales; publicar en GitHub/Render y comprobar salud y acceso protegido, siguiendo la autorización del propietario.

Aceptación: primera misión antes del contenido secundario en Hoy; un único acceso global a Balta; cinco controles primarios móviles; todos los destinos existentes alcanzables; contexto conservado al editar; ningún cambio de economía o datos; compilación y pruebas correctas.
