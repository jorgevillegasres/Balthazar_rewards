# Respaldo y restauración de Balthazar

El botón **Descargar respaldo** de Perfil genera un JSON `balthazar-backup`
versión 1 con el estado: tareas, proyectos, propósitos, rutinas, recompensas,
saldo, sesiones, historial diario y los comprobantes recientes de actividad
conservados en ese estado. Incluye los enlaces de soporte (`supportLinks`).
Los enlaces siguen apuntando al recurso externo original y su disponibilidad
depende de ese recurso.

El JSON **no contiene los archivos adjuntos** del bucket privado
`balthazar-supports`, ni las filas de `public.balthazar_operations`.
Importarlo no traslada esos archivos ni restaura esa tabla. El temporizador se
importa pausado y la aplicación exige un espacio sin actividad.

## Preparar una copia consistente y privada

1. Detén temporalmente las modificaciones del espacio, las cargas de archivos
   y las solicitudes de Balta. Registra fecha, proyecto de origen y UUID del
   propietario para relacionar las tres copias. Una descarga durante cambios
   puede dejar copias de estado, archivos y operaciones de momentos distintos.
2. Descarga el JSON de Perfil y comprueba que contiene `format`, `version`,
   `exportedAt` y `state`. Conserva la fecha y una suma SHA-256 del archivo.
3. Copia los archivos adjuntos por separado como se describe abajo.
4. Conserva las operaciones de Balta por separado. La exportación de Actividad
   sirve para consultar historial; para una restauración de la tabla necesitas
   además una copia administrativa completa, descrita abajo.
5. Guarda JSON, archivos, inventarios y copia de operaciones cifrados en un
   destino privado fuera del repositorio y de Render. Restringe el acceso al
   propietario y al administrador encargado. No incluyas claves, tokens ni
   URLs firmadas como credenciales de restauración.

## Copiar los archivos adjuntos de Storage

Para una copia manual, abre los soportes de cada tarea y descarga cada archivo
con la sesión de su propietario. Anota el ID de la tarea y el nombre del
archivo junto a cada descarga. La aplicación permite volver a adjuntarlos a
esas tareas después de importar el estado; esta vía genera nuevos IDs de
archivo.

Para preservar las rutas originales, un administrador autorizado debe copiar
los objetos del bucket `balthazar-supports` cuyo prefijo sea exactamente
`<UUID_del_propietario>/`, usando el acceso administrativo de Storage. Copia
los bytes de cada objeto y crea un inventario con ruta completa,
`<UUID_del_propietario>/<ID_de_tarea>/<ID_de_archivo>`, tamaño, tipo MIME y
SHA-256. Comprueba todas las páginas del listado y descarga cada objeto;
exportar únicamente los metadatos de `storage.objects` no copia los bytes.
Las copias de la base de datos y el JSON de Perfil tampoco contienen esos
bytes.

Conserva el bucket privado. Filtra por propietario incluso con credenciales
administrativas, ya que estas pueden acceder a otros usuarios. No conviertas
el bucket en público ni amplíes las políticas de acceso para hacer la copia.
Este procedimiento es manual: Balthazar no implementa un exportador completo
automático de Storage.

## Copiar las operaciones de Balta

En **Actividad → Exportar operaciones** se descarga `balthazar-activity`.
Este archivo contiene un resumen de los últimos 90 días, hasta 10.000 filas;
revisa `truncated`. No contiene todas las columnas necesarias para restaurar
`balthazar_operations`, y tampoco garantiza todos los registros históricos.
El JSON de Perfil conserva los comprobantes recientes dentro del estado,
que son una colección diferente.

Para una copia completa, un administrador autorizado debe exportar desde
PostgreSQL **todas las columnas y todas las filas** de
`public.balthazar_operations` con `user_id` igual al UUID del propietario,
sin filtro de fecha ni límite. La tabla contiene propuestas y datos privados.
Como comprobación de alcance, usa consultas parametrizadas equivalentes a:

```sql
select count(*) from public.balthazar_operations where user_id = :owner_uuid;
select * from public.balthazar_operations
where user_id = :owner_uuid order by created_at, id;
```

`:owner_uuid` representa un parámetro que debe proporcionar la herramienta
administrativa, no una consulta lista para pegar sin sustituirlo. Registra el
recuento y una suma SHA-256 de la exportación. Usa un formato que conserve los
UUID, enteros, fechas y JSON de `proposal`; incluye `revision`, `request_hash`,
`status` y la clave compuesta `user_id,id`. Documenta la versión de las
migraciones usada en origen. El archivo de Actividad es un complemento de
consulta, no un formato de importación de esta tabla.

## Restaurar y comprobar antes de usar el destino

1. Prepara un proyecto de prueba privado con las migraciones de la aplicación,
   el propietario autorizado, RLS y el bucket privado con sus restricciones
   originales. Mantén las credenciales administrativas fuera del cliente.
   Registra el UUID de destino: el mismo correo no garantiza el mismo UUID en
   otro proyecto.
2. Importa el JSON de Perfil en un espacio sin actividad. Comprueba tareas,
   IDs, proyectos, enlaces, rutinas, saldo e historial y que el temporizador
   quedó pausado. No fuerces una importación encima de progreso existente.
3. Restaura los adjuntos después de que existan las tareas. Puedes volver a
   subirlos desde sus soportes usando el inventario, o hacer una carga
   administrativa que preserve el ID de tarea y el ID de archivo. En un
   cambio de propietario, sustituye únicamente el prefijo de propietario por
   el UUID de destino; revisa la correspondencia antes de cargar. Conserva
   nombres y tipos admitidos y evita sobrescribir objetos existentes.
4. Compara número de archivos, tamaños y SHA-256 con el inventario. Con la
   sesión del propietario de destino, abre y descarga los archivos de cada
   tarea. Comprueba que una sesión sin permiso no puede leerlos.
5. La aplicación no ofrece importación de `balthazar_operations`. Conserva la
   copia completa como archivo privado, o encarga su restauración a un
   administrador mediante las herramientas de PostgreSQL en el proyecto de
   prueba. Este debe validar columnas, restricciones, UUID de propietario y
   claves compuestas, y resolver conflictos sin sobrescribir filas. Si cambia
   el propietario, revisa las referencias de propuestas además de `user_id`.
   Las revisiones del estado importado pueden diferir de las originales:
   conservar operaciones históricas no hace reutilizables sus propuestas.
   No vuelvas a enviar solicitudes ni ejecutes automáticamente operaciones
   pendientes de la copia; revísalas antes de reanudar el uso de Balta.
6. Comprueba el recuento y las columnas de las operaciones restauradas contra
   la copia completa. Revisa la vista Actividad teniendo en cuenta su ventana
   de 90 días y la reconciliación de estados con los comprobantes del JSON.
   Verifica acceso por propietario y rechazo para otra cuenta permitida.
7. Conserva las copias de origen hasta completar y registrar estas comprobaciones.
   Ensaya primero en el destino de prueba; este documento no constituye un
   registro de una restauración ejecutada.

El respaldo manual complementa la política de respaldo y recuperación de la
base de datos. Hace falta planificar y verificar por separado la conservación
de los bytes de Storage y de las operaciones; no existe aquí una migración
automática completa entre proyectos o cuentas.
