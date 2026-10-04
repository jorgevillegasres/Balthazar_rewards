# Ejecución diaria Implementation Plan

**Goal:** Conectar Hoy con acciones disponibles sin modificar recompensas ni datos existentes.
**Architecture:** Selectores compartidos del dominio para disponibilidad, avance y contador. Componente de acciones diarias reutilizado en Today; Quest enlaza detalle y retorno tras confirmar subtarea.
**Tech Stack:** Next.js, React, TypeScript, node:test.

Alcance aprobado: correcciones e integración Hoy–subtareas de la revisión; no ampliar IA ni respaldo en esta entrega. Ejecutar con executing-plans.

- [x] Añadir pruebas de selección con padres archivados/bloqueados/dependencias, contador y resultado listo; observar fallo y añadir selectores.
- [x] Integrar acciones en Today, corregir consola/rescate y fila bloqueada; contextualizar Focus y retornar a principal tras completar.
- [x] Ejecutar pruebas y build; revisar UI mediante renderizado con datos ficticios y comprobar cambios.
- [x] Preparar publicación por commit/push y verificación de Render live y salud pública sin modificar datos reales.
