# Correcciones de la auditoría de Balthazar

El usuario autorizó proceder sobre la auditoría completa del 11 de octubre. Esta entrega corrige F01–F16 sin añadir módulos ni cambiar la identidad visual aprobada. El informe original y sus reproducciones están en `../../../../outputs/auditoria-balthazar-2026-10-11.md` respecto al repositorio.

## Comportamiento acordado

- Una elección explícita «Sin proyecto» prevalece sobre el proyecto desde donde se captura.
- Los resúmenes locales de proyectos no muestran controles de IA ni un envío sin efecto.
- Una operación de Balta pendiente sobrevive al cierre del panel en la misma sesión y cuenta. Su identificador se consulta/reintenta sin generar una segunda operación. No se añade almacenamiento persistente de conversación.
- El consentimiento describe propósitos y los demás datos enviados. No se usa la clave expuesta en el chat.
- Las subtareas pueden compartir título entre distintas familias, pero los duplicados dentro de la misma principal se rechazan. Reanudar/extender enfoque comprueba las dependencias actuales.
- Los límites del estado y del importador de respaldos coinciden. El día del respaldo se valida en la zona horaria del perfil. No se descarta historial silenciosamente.
- Authentication limita bytes durante la lectura, antes de interpretar JSON o consultar Supabase.
- La pantalla de respaldo explica que los archivos de Storage y el registro separado de operaciones no están incluidos y ofrece instrucciones para preservarlos.
- Los diálogos encadenados recuperan foco en un control externo estable. La navegación orienta al usuario mediante el título de página y acceso al contenido.
- Las selecciones de modo tienen estado accesible; los títulos de misiones ganan espacio en móvil sin reducir los botones táctiles. Los filtros sobreviven a entrar/salir de enfoque y se reinician al cambiar de cuenta.
- Los modos de acceso no cambian mientras una solicitud está en curso.

## Límites

No migraciones, acceso a datos privados, gasto de IA ni rotación de secretos sin herramientas adecuadas. Las comprobaciones de infraestructura, lector de pantalla, restauración real y permisos de micrófono que la auditoría dejó pendientes se documentan como pendientes, sin declarar que fueron ejecutadas.

## Aceptación

Regresiones reproducidas antes de corregir, suite completa y compilación correctas, revisión independiente, pruebas de interfaz con datos ficticios, publicación en GitHub y confirmación del commit funcional desplegado en Render.
