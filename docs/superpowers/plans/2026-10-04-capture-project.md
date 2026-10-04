# Capture project choice Implementation Plan

**Goal:** Elegir proyecto antes de la captura asistida y respetarlo en las propuestas.

**Architecture:** Campo opcional projectId en la solicitud; vacío significa Sin proyecto, ausente mantiene compatibilidad. Contexto y validación aplican la elección. AssistantCapture permite elegir y editar antes de guardar.

**Tech Stack:** Next.js, React, Zod, node:test.

- [ ] Añadir pruebas en tests/assistant.test.mjs para contexto filtrado, elección aplicada, Sin proyecto explícito y proyecto inválido; ejecutar node --experimental-strip-types --test tests/assistant.test.mjs y observar fallos.
- [ ] Actualizar lib/assistant.ts y app/api/assistant/route.ts con validación y asignación. Proyectos desconocidos fallan antes de reservar cuota.
- [ ] Añadir selector en AssistantCapture.tsx, recibir selección inicial desde Capture.tsx y actualizar área al editar proyecto de una propuesta.
- [ ] Ejecutar npm run build, revisar diff y comprobar interfaz con datos ficticios si no hay sesión disponible.
- [ ] Publicar en main y comprobar commit live en Render y salud del servicio.
