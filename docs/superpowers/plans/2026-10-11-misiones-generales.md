# Vista general — Implementation Plan

> Ejecutar en esta sesión con executing-plans. El diseño ya está aprobado; proceder sin nueva confirmación.

**Goal:** Ver y avanzar misiones de todos los proyectos desde una lista visible.

**Architecture:** Modelo puro de selección en lib/mission-overview.ts; Missions reutiliza filas y comandos. navigation cambia únicamente la pestaña inicial de Misiones. Sin migraciones.

**Tech Stack:** React, TypeScript, node:test, CSS existente.

- [x] Crear tests/mission-overview.test.mjs: selección pendiente sin duplicados, subtareas opcionales, padre cerrado excluido, bloqueo propio/heredado, filtro y búsqueda. Ejecutar `node --experimental-strip-types --test tests/mission-overview.test.mjs` antes de implementar y verificar fallo por módulo ausente.
- [x] Crear `overviewGroups(s,{showSubtasks,query,area})` que devuelve grupos con id/name/tasks; `missionBlocked(s,t)` comprueba estado y dependencia de tarea/padre. Filtrar cerradas y familias cerradas, ordenar como lista actual por created descendente. Registrar test en package.json y repetir hasta pasar.
- [x] Modificar lib/navigation.ts y tests/navigation.test.mjs: Misiones inicia Vista general; Proyectos conserva pestaña y contexto. Mantener transiciones existentes.
- [x] Modificar Missions.tsx: pestaña Vista general, control Mostrar subtareas, secciones abiertas, etiquetas proyecto/padre/estado y acciones existentes. `canStartTask` regula Enfoque, además de busy/focus. Añadir CSS acotado para encabezados y filtros sin overflow.
- [x] Ejecutar build completo, inspeccionar diff y revisar en navegador con transporte ficticio a 390/1440. Eliminar fixture antes de build final. No usar datos de producción.
- [x] Commit, push main y verificar commit exacto live en Render; health200/private401/origin403. Registrar resultado.
