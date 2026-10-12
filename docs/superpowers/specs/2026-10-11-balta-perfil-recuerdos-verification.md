# Verificación: perfil y recuerdos elegidos de Balta

Commit funcional: `98e7650d04341b815825ee90652db6411eb64f41`.

## Entrega

- Perfil → Configuración: apelativo opcional, forma de trabajar, humor y acompañamiento. La inclusión en consultas se habilita explícitamente; los espacios existentes siguen sin personalización configurada.
- Recuerdos revisables y editables: veinte entradas como máximo, 400 caracteres por entrada; borrar uno o todos exige confirmación y recupera foco en un destino estable.
- Guardado por texto desde Perfil o Balta → Escribir → Guardar un recuerdo · sin IA. No abre una consulta de organización ni crea una misión.
- Voz: `remember_information` produce un borrador a partir de una petición explícita del turno actual. El usuario edita y confirma con Guardar recuerdo; se cierra la sesión y se guarda únicamente ese contenido. No hay guardado autónomo en modo auto, ni un nuevo tipo de operación de harness.
- Contexto de texto y voz: mismo perfil y recuerdos habilitados, sin nombre automático de cuenta, IDs de recuerdos o metadatos de fechas. Desactivar excluye toda la personalización de consultas nuevas sin borrar datos.
- Estado JSON privado y comandos con revisión CAS e idempotencia existentes; sin nuevas tablas, políticas, bibliotecas ni credenciales. Misiones, economía y permisos de ejecución se conservan.
- Respaldo incluye perfil y recuerdos, acepta formato anterior sin esos campos y no permite sobrescribir un espacio ya personalizado. Copias anteriores pueden conservar registros borrados del estado activo.

## Pruebas y revisión

- Regresiones nuevas observadas antes de implementar: comandos desconocidos y personalización ausente en el contexto. Pruebas de capacidad, duplicados, confirmación, edición/borrado, respaldos, aislamiento por propietario, CAS, reintentos y exclusión de contexto.
- Protocolo de voz real del hook ejecutado con RTC/micrófono/transporte ficticios: una transcripción de otro turno no autoriza recuerdos; petición correcta produce borrador; sin POST al harness, sin escritura automática, con límite de seis propuestas y continuación de respuesta.
- `npm run build`: **229/229 pruebas**, TypeScript y compilación Next correctos; salida 0.
- Revisión independiente de requisitos y código aprobada; segunda revisión de integración también aprobada.

## Navegador con datos ficticios

- Crear perfil «Capitán» y una preferencia; activar su uso: contexto muestra únicamente campos elegidos.
- Crear y editar un recuerdo, conservando ID y fecha de creación.
- Desactivar uso: contexto null, datos almacenados permanecen.
- Cancelar borrado: el registro permanece; confirmar borrado: desaparece y el foco vuelve al título de recuerdos.
- Guardar desde Balta por texto: registro aparece, contador de llamadas de IA ficticias permanece en cero.
- Simular «recuerda que prefiero preparar mis clases por la mañana»: antes de confirmar hay solo un borrador. Editarlo y confirmar crea exactamente el texto revisado y desconecta la sesión.
- Confirmar borrado de todos: cero recuerdos, perfil preservado y foco estable.
- Sin desbordamiento del documento en 360/768/1440px: clientWidth/scrollWidth 345/345, 753/753 y 1425/1425; botones de editar/borrar 44×44px.
- Captura con datos ficticios fuera del repositorio: `outputs/balthazar-perfil-recuerdos-qa.png`, directorio padre.
- Fixture `/dev-design` eliminado antes del build; servidor de prueba detenido, pestaña cerrada y viewport restablecido. No se usó información de la cuenta real ni servicios de IA pagados.

## Publicación

GitHub main contiene el commit funcional. Render confirmó **live** para `dep-db62veqvcj2c73f760m0` de ese mismo commit el 12 de octubre a las 00:55:42 UTC (11 de octubre, 19:55:42, Bogotá).

Comprobaciones públicas posteriores: salud y login 200; lectura del estado sin sesión 401; apertura de voz sin sesión 401; escritura sin Origin 403. APIs privadas con Cache-Control private/no-store. La prueba sin sesión no abrió llamadas a OpenAI ni guardó datos. Cierre documental publicado con `[skip render]`.

## Límites reales

Se verificaron construcción de contexto y controles de aplicación con proveedores ficticios. No se escuchó micrófono/audio real ni se evaluó la calidad de respuestas personalizadas del modelo; requiere prueba consentida del propietario en una conversación nueva. No se probó una restauración de la infraestructura real ni aislamiento RLS con dos sesiones reales; las políticas existentes no se cambiaron. La exclusión/borrado se aplica a consultas futuras y al estado activo de Balthazar, no elimina respaldos anteriores ni información ya enviada a un proveedor en una sesión previa. No se conservaron conversaciones o grabaciones en Balthazar.
