# Centro de control personal — Implementation Plan

> Aplicar subagent-driven-development: un implementador posee la integración UI completa; revisión independiente y QA del coordinador. El diseño y publicación están autorizados.

**Goal:** Aplicar la maqueta aprobada con datos y acciones reales de Balthazar.
**Architecture:** Componentes propios y presentación sobre el store autenticado actual; dock reutiliza diálogos; estado de expansión permanece por página/cuenta en Quest.
**Tech Stack:** Next16/React19/TypeScript, CSS existente, Lucide y Node test runner. Sin dependencias nuevas.

- [x] Escribir regresión de expansión de misiones por página/cuenta y conservación al remontar antes de implementar; añadir solo el estado necesario a `lib/ui-state.ts` y pruebas existentes.
- [x] Implementar `BaltaDock.tsx`; integrar Quest con escritorio/dock y lanzadores móvil. Los callbacks abren control/day/task/memory/voice existentes; adaptar initialKind memory de ControlDialog si hace falta. Evitar estados falsos de conversación/conectividad.
- [x] Organizar Today en prioridad/lista de otras misiones y bloques secundarios. Mantener toda acción y contenido funcional existente; eliminar decoración que compita con la prioridad.
- [x] Añadir despliegue de subtareas a Missions respetando disponibilidad, dependencias, resultados, filtros y modo individual de subtareas. Mantener Proyectos y archivo/restauración.
- [x] Actualizar navegación, reloj compacto y CSS propio sin copiar bundle Metronic; cuidar 44px, auxiliares12px, texto largo, foco, reduced-motion y páginas secundarias.
- [x] Revisión de requisitos y código independiente; corregir hallazgos antes de publicar.
- [x] QA del coordinador con fixture ficticio aislado en navegador, escritorio/móvil, datos/revisiones y voz simulada; retirar ruta y detener servidor de prueba.
- [x] Build completo con salida0, Gitdiff limpio, commit funcional y publicaciónmain. Confirmar Render live y pruebasHTTP privadas; guardar cierre documental con límites y evidencia.
