# Cierre de correcciones de auditoría

Fecha: 11 de octubre de 2026. Commit funcional: `bd3e2109451563f80509c860bb4f3e11535eb89f`.

## Hallazgos corregidos

| ID | Resultado | Evidencia |
|---|---|---|
| F01 | La selección vacía de proyecto prevalece sobre el origen. | Captura ficticia desde Curso; el proyecto mantiene 3 principales y la nueva aparece «Sin proyecto». |
| F02 | El resumen local no muestra instrucciones, autonomía, consentimiento ni botón de envío. | Navegador: 0 controles de envío y 0 consentimientos en modo proyecto. |
| F03 | Operación de texto pendiente conservada por cuenta en memoria hasta verificarla. | Cierre/reapertura tras error y durante respuesta retrasada; reintento mismo ID/cuerpo: 1 operación, 2 intentos. |
| F04 | Consentimientos de texto y voz incluyen los propósitos enviados y sus datos. | Revisión de payloads y avisos; consentimiento visible en navegador. |
| F05 | Títulos de subtareas repetibles entre familias; duplicados dentro de la misma se rechazan. | Regresión de dominio. |
| F06 | Start/resume/extend validan disponibilidad y dependencias de misión y principal. | Regresiones de dependencia nueva, padre bloqueado y enfoque restaurado. |
| F07 | Capacidades de recompensas, canjes, sesiones, áreas y días alineadas con respaldos. | Pruebas de límite y exportación/importación justo en capacidad; sin descuentos, XP o pérdida de historial al rechazar. |
| F08 | Fecha máxima del respaldo usa zona horaria del perfil. | Pacific/Kiritimati con reloj inyectado y rechazo de día futuro real. |
| F09 | Autenticación limita y cancela lectura a 2000 bytes antes de JSON/Supabase. | 8 pruebas de lector/autenticación: multichunk, UTF-8, origen, límites y flujo normal. |
| F10 | Exclusiones visibles al descargar/importar; procedimiento de copias separadas documentado. | Perfil → Configuración revisado; `docs/migration/BACKUPS.md`. |
| F11 | Diálogos encadenados vuelven al control externo o a un título estable si desaparece. | Balta → Escribir → cerrar devuelve foco a Balta; editar título fuera del filtro devuelve foco a Misiones. |
| F12 | Botones de modo exponen aria-pressed. | Estados verdadero/falso de Vista general y otras opciones inspeccionados en DOM. |
| F13 | Acciones de misión en segunda fila móvil. | 360px: título de 235,2px frente a 93,2px antes; objetivos de 44×44px. |
| F14 | Filtros de misiones por cuenta/página sobreviven a enfoque. | Buscar «conjunto», mostrar subtareas, empezar → pausar/salir conserva ambas selecciones. Prueba pura de aislamiento de cuenta. |
| F15 | Modos e inputs de acceso bloqueados durante solicitudes. | Recuperación ficticia retrasada: botones de crear/contraseña deshabilitados, final correcto en Confirmar acceso. |
| F16 | Navegación enfoca título de destino y ofrece acceso directo al contenido. | Misiones/Enfoque/Perfil con H1 activo y enlace «Ir al contenido principal» probado con Enter. |

## Verificación

- `npm run build`: salida 0, **210/210 pruebas** y compilación TypeScript/Next correctas.
- Revisión independiente de requisitos y código aprobada, tras corregir conflicto 409 que bloqueaba recuperación y alternativa de foco cuando desaparece el botón de origen.
- Sin desbordamiento horizontal del documento en 360, 768 y 1440px: clientWidth/scrollWidth 345/345, 753/753, 1425/1425.
- Fixtures de interfaz y acceso con datos y respuestas ficticios; no se enviaron consultas de IA ni se escribieron datos de la cuenta real.
- Rutas temporales `/dev-design` y `/dev-login` eliminadas antes de build/publicación. Servidor de prueba detenido y pestañas cerradas; viewport restablecido.
- Capturas externas al repositorio: `outputs/balthazar-auditoria-corregida-movil.png` y `outputs/balthazar-auditoria-corregida-escritorio.png` en el directorio padre.

## Publicación

GitHub main contiene el commit funcional. Render confirmó **live** para `dep-db5vchmk1f9s73eqga70` del mismo commit el 11 de octubre a las 20:50:40 UTC (15:50:40, Bogotá).

Comprobaciones públicas posteriores al despliegue:

| Solicitud | Resultado |
|---|---|
| GET `/api/health` | 200, no-store |
| GET `/login` | 200 |
| GET `/api/quest` sin sesión | 401, private/no-store |
| POST `/api/quest` sin Origin | 403, private/no-store |
| POST `/api/auth` mismo origen y cuerpo ficticio de 2001 bytes | 413, private/no-store |

La comprobación de tamaño rechaza antes de contactar al servicio de autenticación; no crea accesos ni envía correos. El cierre documental se publica con `[skip render]` para no iniciar otro despliegue sin cambios funcionales.

## Límites de la verificación

Estas correcciones no equivalen a una certificación completa de accesibilidad o infraestructura. Quedan pendientes la prueba con lector de pantalla real, zoom de 200%, teclado móvil, micrófono/voz real consentida, carga y latencia sostenidas, restauración integral de Storage/operaciones y comprobación de políticas desplegadas con cuentas independientes. No se inspeccionaron variables secretas ni se verificó la revocación de la clave previamente expuesta; si aún está activa, el propietario debe revocarla y sustituirla.

La recuperación de texto es temporal en la pestaña actual: no persiste al recargar/cerrar el navegador ni crea memoria de conversaciones. Para operaciones ya registradas también existe Actividad. El respaldo JSON no incluye archivos adjuntos ni la tabla separada de operaciones; el exportador de Actividad es un resumen limitado, no una copia completa de dicha tabla.
