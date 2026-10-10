# Balthazar: centro de control personal

Fecha: 10 de octubre de 2026. Estado: alcance aprobado; diseño detallado pendiente de revisión del propietario.

## Resultado buscado

Un espacio personal que conecte propósitos, proyectos y acciones. Balta podrá ayudar a decidir y ejecutar acciones internas reversibles, con contexto actual, permisos explícitos y resultados verificables. Se conserva la estética negra, violeta y verde, el acceso privado y los datos existentes.

La primera entrega incluye centro de mando, propósitos vinculados, entrada de texto y voz, y registro de actividad. Se construirá en tres incrementos que puedan verificarse individualmente. No incluye calendario externo, envío de mensajes ni ejecución en segundo plano.

## Situación actual comprobada

- Las tareas, subtareas, proyectos, enfoque y recompensas se guardan en el estado privado del usuario.
- El repositorio escribe con control de revisión y deduplicación de comandos; ambos mecanismos se conservan.
- La asistencia por texto y voz produce propuestas y todavía requiere aplicar cambios en pantalla.
- No existen propósitos personales separados de las recompensas ni un registro de ejecuciones de Balta.
- No hay calendario externo ni interpretación automática de soportes.

## Incremento 1: centro de mando y propósitos

Hoy mantiene las misiones diarias y la consola personal. Se añade una sección «Requiere tu atención» con tareas principales vencidas, bloqueadas y pendientes de organizar. Las fechas representan vencimientos; no se presentan como citas de calendario. Las tareas completadas, canceladas o archivadas no aparecen como pendientes. Las subtareas se consultan dentro de su principal para evitar duplicar alertas.

«Propósitos» permite crear y editar un propósito con título (hasta 160 caracteres), área existente, descripción del resultado esperado (hasta 1.000), fecha objetivo opcional y estado activo o archivado. No crea recompensas ni XP. Un proyecto puede vincularse a un propósito; las tareas heredan esa relación a través de su proyecto. Un proyecto puede quedar sin propósito y una tarea puede seguir sin proyecto.

Cada propósito muestra sus proyectos y el número de tareas principales completadas frente a las activas y completadas de esos proyectos. No se interpreta ese porcentaje como logro automático del propósito. Sin tareas se muestra «Sin acciones vinculadas». Archivar un propósito no archiva sus proyectos ni tareas. Se pueden cambiar vínculos sin alterar los IDs ni el historial.

El centro de mando presenta los propósitos activos, proyectos vinculados y prioridades del día, con accesos al detalle existente. La carga y la selección se calculan desde datos guardados, sin una consulta a IA al abrir la pantalla.

## Incremento 2: registro y reversibilidad

Se añade «Actividad de Balta», un registro de operaciones, no de conversaciones. Cada ejecución incluye ID único, propietario, origen (texto/voz), herramienta, fecha, revisión de entrada, estado y resumen de resultado. Estados: propuesta pendiente, ejecutada, fallida, rechazada y deshecha. Los errores guardan un código controlado y una explicación breve, sin claves, audio, transcripción completa o respuesta cruda del proveedor.

Los cambios de dominio y el resultado exitoso se guardan atómicamente en el estado privado mediante la misma escritura con revisión. Las propuestas y los fallos sin cambio de dominio se registran en una tabla privada de operaciones con RLS por propietario. El ID de ejecución conecta ambos registros; la fuente de verdad de una ejecución aplicada es el estado guardado. Si el registro de una propuesta no puede persistirse, no se ejecuta y se informa al usuario.

Para cada cambio reversible se conserva un comprobante con los campos anteriores y posteriores necesarios. Deshacer exige que esos campos y las relaciones afectadas sigan como los dejó la operación. No restaura una copia completa del estado ni borra trabajo posterior. Si existe conflicto se muestra el motivo y se ofrece abrir el elemento para corregirlo manualmente.

Una tarea recién creada solo se puede retirar mediante deshacer si no tiene cambios posteriores, sesiones, avance, soportes, hijos ni dependencias entrantes. Se conserva como archivada y el registro explica la reversión; no hay borrado definitivo. Un plan solo se puede revertir si sus posiciones y estados no cambiaron y no hay enfoque abierto. Las misiones completadas conservan sus posiciones. Los vínculos de proyecto se revierten solo si mantienen el valor aplicado.

El registro es privado y consultable por páginas; se limita a 200 entradas recientes en el estado y 90 días para propuestas/fallos de la tabla de operaciones. La limpieza de la tabla se hará mediante una operación administrativa explícita; no se promete un proceso programado en esta entrega. No se usa el registro como memoria de conversación ni se envía entero al modelo.

## Incremento 3: Balta como entrada de control

Una entrada común acepta texto o abre el modo voz existente. Ambos usan el mismo catálogo de herramientas y validadores del servidor. Al activar asistencia, el usuario consiente el envío del contexto mínimo a OpenAI. La interfaz indica «Autonomía interna» y permite cambiar esa sesión a «Revisar todo».

Solo una instrucción explícita permite ejecutar. «Crea una tarea…» puede ejecutar captura; «¿Qué debería hacer?» produce una propuesta. Ante ambigüedad, proyecto desconocido o información insuficiente, Balta pregunta o presenta un borrador. Los títulos y documentos almacenados nunca se interpretan como autorización.

### Política inicial de herramientas

| Herramienta | Ejecución | Condiciones |
| --- | --- | --- |
| Consultar prioridades o resumir un proyecto | Lectura | Contexto actual, referencias conocidas y límites de tamaño. |
| Crear pendientes | Automática con instrucción explícita | Hasta diez, títulos únicos, campos validados y proyecto explícito o «Sin proyecto»; nunca inferir una fecha relativa sin resolverla y mostrar la fecha resultante. |
| Proponer un plan del día | Lectura/propuesta | Hasta tres misiones; respetar disponibilidad, energía y minutos indicados. |
| Aplicar un plan | Automática con instrucción explícita | Sin enfoque abierto; conservar tareas completadas; mostrar resultado y opción de deshacer. |
| Crear subtareas | Automática con instrucción explícita | Principal activa identificada, un nivel, proyecto/área heredados y sin reemplazar pasos existentes. |
| Vincular proyecto a propósito | Confirmación en pantalla | Ambos IDs existentes; mostrar relación anterior y nueva. |
| Completar, archivar una tarea existente, cambiar recompensas o canjear | Funciones manuales actuales | No se exponen como herramientas autónomas de Balta. |
| Correo, calendario o cualquier acción externa | No disponible | Se incorporarán en otra fase con confirmación concreta y permisos por servicio. |

El modelo propone una llamada estructurada. El servidor decide si la herramienta es admisible y si necesita confirmación; la decisión nunca depende únicamente de un texto generado por IA. No se permite SQL, HTTP arbitrario, código generado ni acceso general a archivos.

Cada turno admite hasta tres herramientas de lectura y una escritura. No hay ciclos de ejecución automática ni reintentos de escritura con un ID nuevo. Una escritura repetida con el mismo ID devuelve su resultado previo. En conflicto de revisión no se aplica; se actualiza el contexto y se pide revisar la nueva propuesta. Un fallo o una cuota agotada deja disponibles las funciones manuales.

Las ejecuciones no completan tareas ni conceden puntos. Solo se informa «Guardado» después de la respuesta del repositorio. Si la conexión se pierde, el cliente consulta el ID de operación antes de permitir reintentar. Una propuesta pendiente muestra que todavía no produjo cambios.

## Contexto, voz y privacidad

El contexto incluye áreas, propósitos activos, proyectos y tareas relevantes; no incluye identidad, recompensas, soportes ni conversaciones anteriores. El número de elementos y caracteres se limita antes del envío. Se amplían los selectores actuales de contexto, sin enviar el respaldo completo.

Se mantiene la elección del propietario: cada conversación usa los datos actuales, sin memoria persistente entre sesiones. Los propósitos son datos guardados y editables, no recuerdos inferidos. La voz conserva su consentimiento, interrupciones, cierre al ocultar la página y límite de cinco minutos. «Hola Balta» sigue siendo opcional y dependiente del reconocimiento local compatible.

La cuota actual de veinte consultas/aperturas diarias continúa. Cada consulta al proveedor consume una reserva; ejecutar un comando ya validado no consume otra consulta por sí mismo. No se amplían gastos ni límites sin una decisión posterior.

## Datos y compatibilidad

Se añaden colecciones opcionales de propósitos y comprobantes de actividad al estado. Al leer datos anteriores se normalizan a colecciones vacías sin cambiar tareas, saldo o historial. Los proyectos antiguos no requieren un vínculo. La normalización debe ser idempotente y no guardar cambios durante una lectura solo por añadir valores predeterminados.

El respaldo incorpora propósitos y relaciones, con validación de IDs, fechas, límites y referencias. Se aceptan los respaldos anteriores. Los registros de propuestas/fallos almacenados por separado se exportan en una descarga propia; no se afirma que estén incluidos en el JSON de estado. Los archivos binarios siguen requiriendo respaldo separado de Storage.

La tabla de operaciones tendrá migración reproducible y políticas que exijan la sesión del propietario permitido. No se utilizan claves administrativas en rutas del usuario. Una importación solo se permite en un espacio vacío, incluyendo las nuevas colecciones; no sobreescribe actividad existente.

## Organización de implementación

- Centro de mando: componente propio y selectores puros; reutilizar detalle, misiones y enfoque existentes.
- Propósitos: módulo de dominio, vistas de creación/edición y selección de vínculo por proyecto.
- Actividad: modelo de operación, almacenamiento privado, comprobantes y comandos de reversión.
- Harness: catálogo de herramientas, validación de contexto, política de permisos y ejecutor autenticado.
- Texto y voz: adaptadores del mismo ejecutor; los transportes no deciden permisos.

Se evitará concentrar toda la implementación en Quest.tsx. Ese componente únicamente coordinará navegación y apertura de paneles.

## Criterios de aceptación

1. Un propietario existente abre su espacio con las mismas tareas, saldo, sesiones y recompensas.
2. Crea un propósito, vincula un proyecto y ve sus acciones sin alterar el progreso previo.
3. Identifica pendientes y bloqueos desde el centro de mando sin duplicar subtareas ni llamar a IA.
4. Una instrucción explícita de captura crea solo pendientes validados y deja un comprobante.
5. Una pregunta o una instrucción ambigua no produce escrituras.
6. Texto y voz usan los mismos permisos, IDs y referencias; una herramienta inventada se rechaza.
7. Aplicar o revertir un plan conserva las misiones completadas y no concede recompensas.
8. Deshacer no elimina avance, relaciones o soportes posteriores; los conflictos se explican.
9. Repetir una operación tras perder conexión no duplica cambios.
10. Un fallo del proveedor o almacenamiento queda identificado y no se presenta como éxito.
11. Las pruebas cubren respaldo antiguo/nuevo, normalización, RLS, conflictos y reversión. La interfaz se verifica en computador y ancho móvil con datos ficticios.
12. Se verifica el despliegue y las rutas sin sesión. La voz real requiere una prueba del propietario y se informa por separado de las pruebas simuladas.

## Orden de entrega

Primero centro de mando y propósitos; después registro y reversión; finalmente acciones internas de Balta sobre esa base. Cada incremento tendrá su plan, pruebas y verificación antes del siguiente. El resultado de esta etapa de diseño no equivale a una función ya implementada o publicada.
