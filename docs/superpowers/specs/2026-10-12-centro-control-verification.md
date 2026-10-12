# Centro de control — verificación

## Implementación

Diseño aprobado aplicado con componentes y CSS propios. Navegación agrupada, panel de Balta global en escritorio, lanzador equivalente en móvil, prioridad diaria y misiones secundarias desplegables. Subtareas visibles dentro de Misiones, con expansión aislada por cuenta y página. Perfil y recuerdos abre Configuración directamente.

No se importaron dependencias ni scripts del theme. APIs, datos, autenticación, modelos y personalidad conservan sus contratos actuales.

## Revisión y pruebas

- Implementador: regresiones de expansión RED/GREEN y guard de padre cerrado RED/GREEN; 23 pruebas focalizadas y typecheck correctos.
- Revisión independiente: un P2 por checkbox de subtarea con padre archivado/cancelado. Corregido en `missionBlocked`, también cubre padre completado o inexistente. Segunda revisión aprobada, 10 pruebas de overview/ejecución verificadas.
- Suite completa: 234 pruebas, 234 aprobadas, 0 fallos, sin llamadas a proveedores.
- `npm run build` terminó con salida 0: suite completa, compilación webpack, TypeScript y generación de páginas correctos. Tabla de rutas sin `/dev-design`.

## Navegador local

Fixture temporal con datos ficticios, comandos reales del dominio y transporte en memoria; sin escrituras en la cuenta ni consultas a OpenAI/Supabase. Comprobado:

- Panel: organizar día y dividir misión abren modos correctos con consentimiento desmarcado; guardar recuerdo persistió el texto ficticio y se reflejó en Configuración.
- Voz: arranque y cierre con WebRTC/audio simulados; transcripción ficticia produjo un recuerdo pendiente de confirmación. No prueba sonido, micrófono ni proveedor reales.
- Misiones: expandir dos subtareas, entrar en enfoque, pausar/salir conservando expansión y terminar sin completar. Vista plana muestra cada hijo una sola vez.
- Archivar padre deshabilita revisión y arranque de hijos; restauración disponible.
- Cambio a segunda cuenta ficticia vacía elimina las tareas y recuerdos anteriores y restablece navegación/filtros; retorno correcto.
- Captura manual y con Balta conservan selector de proyecto/Sin proyecto y consentimiento.
- Misión secundaria desplegada conserva arranque y detalle/soportes. Secciones Proyectos, Propósitos, Rutinas, Recompensas y Perfil accesibles.
- 360/768/1440 px: ancho del documento igual al ancho visible. En móvil, panel Balta y lista de misiones sin controles de menos de 44 px medidos. Configuración directa también funciona en móvil.
- Consola del navegador sin errores registrados al terminar la prueba.

Evidencia local, directorio padre `outputs`: `balthazar-centro-control-escritorio-qa.png`, `balthazar-centro-control-movil-qa.png`, `balthazar-centro-control-subtareas-movil-qa.png`. Capturas con datos ficticios. Ruta `app/dev-design/page.tsx` retirada antes del build; servidor de prueba detenido y caché dev archivada fuera del repositorio.

## Publicación

- Commit funcional `daf94760bc9a9c9eb90af16e5cbe36e86f56f56e` publicado en GitHub/main mediante fast-forward, idéntico al árbol construido localmente. Sin conflictos ni archivos pendientes tras publicación.
- Render `dep-db6e8o740ujc73dcahh0`: LIVE del commit funcional exacto, finalizó `2026-10-12T13:46:29.656579Z` (08:46:29, Bogotá). Servicio `srv-davj479srm7s73c766rg`.
- Comprobaciones HTTP públicas con salida 0: `/api/health` 200/no-store; `/api/quest` sin sesión 401/private,no-store; POST `/api/voice` con Origin válido sin sesión 401; POST voz sin Origin 403; `/dev-design` 404; `/login` 200.
- No se escribió en datos de producción ni se inició una llamada real de IA durante QA. La validación autenticada funcional usa fixture local, por lo que no demuestra una llamada de voz real ni su sonido.
- Cierre documental posterior con `[skip render]`; no cambia código de ejecución ni obliga a otro despliegue.
