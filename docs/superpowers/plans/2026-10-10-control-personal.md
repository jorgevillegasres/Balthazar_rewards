# Centro de control personal Implementation Plan

**Goal:** Implementar el diseño aprobado de propósitos, centro de mando, actividad reversible y acciones internas de Balta.

**Architecture:** Mantener el repositorio privado con CAS. Añadir módulos de dominio acotados y un ejecutor de herramientas con catálogo cerrado, compartido por texto y voz. Las propuestas/fallos viven en una tabla privada; las ejecuciones y sus comprobantes se guardan con el cambio de estado.

**Tech Stack:** Next.js/React, TypeScript, Supabase con RLS, OpenAI Responses y Realtime actuales, node:test.

## 1. Propósitos y centro de mando

Archivos: lib/purposes.ts, app/components/Purposes.tsx, app/components/ControlCenter.tsx, app/lib/domain.ts, lib/backup.ts, tests/purposes.test.mjs.

- [x] Pruebas antes de código: respaldo antiguo→colecciones vacías, vínculos válidos, archivo sin cascada y cálculo sin subtareas duplicadas.
- [x] Dominio: `purpose` crea/edita `{id,title,area,description,due,status}`, `linkPurpose` valida ambos IDs; límites 100 propósitos y conservación de referencias.
- [x] Selectores: principales activas vencidas/bloqueadas/inbox; métricas de proyectos y propósitos excluyen canceladas/archivadas/subtareas.
- [x] Interfaz: formularios y vínculos con confirmación; tarjetas con acceso a tareas y proyectos. No llamadas a IA al abrir.
- [x] Respaldo compatible y normalización idempotente; importación comprueba nuevas colecciones.

## 2. Actividad y reversión

Archivos: lib/activity.ts, app/components/Activity.tsx, lib/operation-store.ts, app/api/activity/route.ts, supabase/migrations/20261010_balthazar_operations.sql, tests/activity.test.mjs.

- [x] Pruebas antes de código: deduplicación, undo con conflicto y protección de sesiones, soportes, avance y dependencias entrantes.
- [x] `baltaAction` envuelve solo capture/assistDay/linkPurpose, registra origen/resumen/fecha/comprobante en la escritura CAS; `undoBalta` comprueba valores posteriores antes de restaurar campos concretos.
- [x] Deshacer creación archiva únicamente tareas intactas. Nunca restaurar el estado completo ni tocar economía.
- [x] Tabla de propuestas/fallos con propietario, ID, herramienta, estado, revisión y código; RLS por propietario y correo permitido, sin claves administrativas.
- [x] Interfaz paginada y exportador separado; 200 comprobantes recientes en estado, vista de operaciones de últimos 90 días.

## 3. Harness compartido

Archivos: lib/harness.ts, app/api/harness/route.ts, app/components/ControlDialog.tsx, app/components/useVoice.ts, app/components/VoiceDialog.tsx, lib/assistant.ts, lib/voice.ts, tests/harness.test.mjs.

- [x] Pruebas antes de código: herramienta desconocida/no autorizada, instrucción ambigua→propuesta, preguntas sin escritura, revisión vencida, tareas duplicadas y preguntas esenciales sin aplicación.
- [x] Reusar buildContext/askOpenAI/validateProposal; catálogo capture/day/task. task convierte pasos en subtareas sin reemplazar pasos originales.
- [x] Solicitud explícita del usuario y modo autonomía determinan la política en servidor; modelo no decide permisos. Máximo una escritura por turno y mismo ID para reintentar.
- [x] Registrar propuesta antes de ejecutar, conservar resultado pendiente/fallido. Consulta de ID verifica ejecución tras pérdida de respuesta.
- [x] Texto y voz llaman el mismo endpoint; las propuestas editables se aplican mediante baltaAction y quedan registradas. Consentimiento por sesión, sin memoria conversacional.

## 4. Integración, revisión y publicación

Archivos: Quest.tsx, globals.css, package.json, README.md, state-repository.ts y documentación de verificación.

- [x] Copia privada del estado actual sin imprimirlo ni versionarlo; verificar conteos sin mutación.
- [x] Integrar navegación Propósitos/Actividad y entrada texto/voz preservando paleta.
- [x] Ejecutar `npm test`, `npm run build`, revisión independiente de especificación y seguridad.
- [x] Aplicar y comprobar RLS/migración con consultas sin datos sensibles; prueba UI con datos ficticios y ancho móvil.
- [ ] Commit, merge FF y push main; verificar Render live, salud y rechazo sin sesión. Audio real separado de transporte simulado.

No se considera terminado ningún incremento sin pruebas y compilación. Los registros de conversación, herramientas externas y ejecución en segundo plano quedan fuera.
