# Vista general — verificación

- Pruebas escritas antes del modelo: fallo inicial por módulo inexistente, luego cuatro aprobadas. Prueba de navegación falló con Activas como entrada y pasó tras cambiarla a Vista general.
- Revisión independiente de código: aprobada, sin hallazgos P1/P2.
- QA local con componentes reales y transporte ficticio: entrada Misiones presenta seis tareas de varios proyectos sin desplegar grupos; mostrar subtareas agrega dos acciones con proyecto y padre; búsqueda conjunto encuentra padre e hijo; iniciar la subtarea abre Enfoque; pausar permite volver; detalle de otra subtarea abre correctamente.
- Proyectos mantiene su cuadrícula. Filtro Finanzas presenta estado vacío; Todas restaura la lista. Dependencia bloqueada mantiene acción deshabilitada.
- Ancho 390: clientWidth/scrollWidth 375/375; ancho 1440: 1425/1425. Capturas móvil y escritorio inspeccionadas. Consola local sin errores/advertencias.
- Sin escrituras de producción ni llamadas IA/audio. Ruta ficticia eliminada antes de build final. Cambios limitados a presentación, selección y navegación; sin backend, base de datos o economía.

- `npm run build`: salida 0, 173 pruebas aprobadas, TypeScript y compilación correctos; ruta temporal no incluida. `git diff --check` sin errores.

Pendiente de registrar despliegue exacto.
