# Subtareas y soportes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task.

**Goal:** Reducir ruido en Misiones y registrar acciones y soportes sin duplicar recompensas.

**Architecture:** parentId opcional sobre las tareas existentes, mutaciones atómicas del dominio y valores opcionales compatibles en respaldo. Archivos aislados en Storage privado con API autenticada; enlaces en estado de tareas. Detalle de misión y grupos desplegables reutilizan los componentes y la paleta actuales.

**Tech Stack:** Next.js, React, Supabase, TypeScript, Zod y node:test.

- [x] Dominio y respaldo: tests de conversión (`type:'reparent'`), captura hija (`parentId`), completar hija sin premio y cierre principal (`resultConfirmed:true`). Rechazar ciclos/niveles/completadas; heredar proyecto/área. Añadir `supportLink`/`removeSupportLink` con URL http(s). Ejecutar tests antes y después de los cambios.
- [x] Soportes: lib/supports.ts valida formatos y tamaños; app/api/supports/route.ts valida sesión/origen/tarea; storage privado con políticas propietario. SupportPanel.tsx lista, sube, descarga y elimina explícitamente. Tests de validación y aislamiento; migración y revisión de políticas.
- [x] Interfaz: TaskDetail.tsx presenta subtareas con añadir/convertir/separar; pasos antiguos y soportes. Missions.tsx agrupa tareas principales por proyecto, busca hijos y muestra avances. Quest.tsx integra detalle y confirmación de resultado; Capture conserva jerarquía; Focus puede enfocar hijos.
- [x] Compatibilidad IA: contexto de misión incluye subtareas relevantes; orientación diaria excluye hijas y agrupaciones cerradas/bloqueadas. Verificar contrato existente.
- [x] Verificación y publicación: tests completos, build, revisión independiente, QA con datos ficticios móvil/escritorio, migración privada y pruebas de acceso, publicación preparada para commit/push a main y comprobación de deploy live. No modificar tareas reales en verificaciones.

