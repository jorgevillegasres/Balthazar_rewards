# Rutinas personales sostenibles

Estado: diseño concreto para revisión; no implementado ni publicado.

## Objetivo y alcance

Balthazar distribuye pequeñas acciones de bienestar y desarrollo durante la semana sin llenar Misiones ni convertir omisiones en deuda. Conserva el diseño negro, violeta y verde actual. Se añaden rutinas editables y un bloque en Hoy; no se crean notificaciones, cron jobs ni escuchas en segundo plano.

## Experiencia

- Un bloque «Cuidarme hoy» en Hoy muestra las rutinas programadas para la fecha local, su duración y botones Completar, Versión breve y Omitir hoy.
- Una vista «Rutinas», accesible desde ese bloque, permite crear, editar, pausar y reactivar una rutina y consultar la semana. No añade otra sección a la navegación principal.
- Cada rutina tiene título, área existente, proyecto opcional, días de la semana, fecha de inicio, duración normal, duración breve y estado activo o pausado. Su propósito se obtiene del proyecto vinculado, siguiendo la relación existente.
- Las rutinas no ocupan los tres espacios de prioridades de misiones, no crean tareas automáticamente y no aparecen en el listado de Misiones.
- La carga sugerida inicial es de unos 15 minutos diarios. El editor muestra la suma por día y permite cambiarla; no recorta ni omite acciones automáticamente.
- Las rutinas pasadas sin registro quedan «Sin registro». No se arrastran a hoy, no se marcan completadas y no reciben puntos. No penalizan la racha de misiones.
- Completar registra una sola realización por rutina y fecha, con modalidad normal o breve. Se puede corregir el registro del día; Omitir registra una elección sin castigo.

## Catálogo inicial

Un paquete opcional y revisable «Mi semana ligera» contiene:

| Acción | Días | Normal | Breve |
|---|---|---:|---:|
| Caminar o hacer movimiento suave a mi ritmo | Todos | 10 min | 2 min |
| Aprender algo y escribir una idea aplicable | Lunes, jueves | 5 min | 2 min |
| Explicar un concepto en voz alta | Martes | 5 min | 2 min |
| Ordenar un rincón de mi espacio | Miércoles | 5 min | 2 min |
| Contactar a alguien importante | Viernes | 5 min | 2 min |
| Revisar mi semana y elegir un enfoque | Domingo | 5 min | 2 min |

El sábado contiene solo movimiento. El paquete se muestra antes de guardarlo, permite cambiar días y acciones y se instala una sola vez. Usa el área Personal existente y no crea proyectos o propósitos sin selección del usuario. No representa un programa médico ni prescribe intensidades.

## Datos y persistencia

Se extiende el estado privado existente con `routines` y `routineEntries`, inicializadas vacías en datos antiguos. Máximo 100 rutinas. Cada entrada identifica rutina y fecha ISO local, estado completada u omitida, modalidad y momento del registro. La combinación rutina-fecha es única. Se conservan registros de los últimos 366 días; la interfaz explica esta ventana.

Las acciones se validan en el dominio y se guardan mediante el repositorio autenticado actual con revisión CAS. No se aceptan cambios desde clientes no autenticados. Un reintento no duplica registros. Una rutina pausada no ofrece nuevas realizaciones. Las ediciones de calendario y duración afectan al presente y futuro; los registros completados conservan título, duración y modalidad históricos.

El calendario se deriva de la fecha en la zona horaria del perfil. Consultar Hoy no genera escrituras ni crea ocurrencias retroactivas. Crear una rutina nueva establece por defecto la fecha local actual como inicio.

## Puntos y asistente

Esta primera entrega registra constancia de rutinas por separado: no modifica XP, puntos, canjes ni rachas. Así se evita cambiar la economía existente al introducir acciones diarias repetidas. La pantalla indica esta diferencia claramente.

El asistente para organizar el día recibe únicamente las rutinas previstas hoy, su duración y estado, dentro de los límites de contexto existentes y con consentimiento. Las presenta como recomendaciones separadas de las misiones. No puede crear, completar ni omitir rutinas por voz o texto en esta entrega; esas acciones se realizan con los botones.

## Compatibilidad y verificación

Exportar/restaurar incluye las dos colecciones y valida sus límites, fechas, relaciones y unicidad; los backups antiguos se importan como rutinas vacías. Se preservan proyectos, misiones, soportes, actividad y economía.

Pruebas necesarias: días y fecha de inicio, cambio de fecha local, pausa/reactivación, edición sin alterar registros históricos, normal/breve, omisión sin arrastre, reintento y concurrencia CAS, límites, backup antiguo/nuevo, ausencia de cambios en economía y ausencia de creación automática de tareas. Verificación visual de Hoy y editor en móvil y computador, build y regresión existentes antes de publicar en Render.

## Aceptación

1. El usuario puede instalar y adaptar el paquete inicial sin duplicados.
2. Hoy muestra solo rutinas activas previstas para su fecha local, además de sus misiones habituales.
3. Completar o registrar versión breve deja una única realización; omitir no acumula pendientes.
4. Las rutinas se pueden pausar y editar; la carga semanal permanece visible.
5. Los datos anteriores, autenticación y respaldos siguen funcionando.
