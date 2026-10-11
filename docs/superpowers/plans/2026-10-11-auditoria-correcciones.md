# Correcciones de auditoría — plan de implementación

**Goal:** Resolver F01–F16 del informe aprobado sin ampliar el producto.
**Architecture:** Corregir las causas en dominio, lectores de requests y componentes existentes; compartir constantes de capacidad y conservar estado de interfaz y operaciones únicamente dentro de la sesión y cuenta actuales.
**Tech Stack:** Next 16, React 19, TypeScript, Node test runner, Supabase y Render.

Los frentes son independientes y tienen propiedad de archivos. La guía dispatching-parallel-agents permite su ejecución simultánea. Ningún agente confirma commits ni despliega; la integración, revisión y publicación pertenecen al coordinador.

## 1. Integridad — F05, F06, F07, F08

- [x] Reproducir en pruebas de dominio títulos idénticos bajo dos principales, cambio de dependencia durante pausa, 2000 recompensas y respaldo del día siguiente en Pacific/Kiritimati.
- [x] Modificar `app/lib/domain.ts`, `lib/backup.ts` y una unidad de límites compartidos. Alinear límites al crear recompensas, canjear y registrar sesiones; rechazar sin pérdidas al alcanzar capacidad.
- [x] Verificar los casos y suite de dominio/subtareas/almacenamiento. Comprobar exportación/importación de estados producidos por comandos.

## 2. Seguridad y respaldos — F09, F10

- [x] Probar lectura incremental que cancela un stream al exceder el límite, incluyendo UTF-8 multibyte.
- [x] Sustituir `request.text()` en `app/api/auth/route.ts` por lectura limitada, manteniendo errores y la comprobación de origen. Reutilizar el lector de `lib/backup-transfer.ts` si conserva semántica de respaldos.
- [x] En `app/components/BackupPanel.tsx`, explicar antes de descargar/importar exclusiones de archivos y operaciones; documentar preservación/restauración en un archivo dedicado.

## 3. Interfaz — F01, F11–F16

- [x] Reproducir en navegador captura sin proyecto desde un proyecto, foco tras cerrar un diálogo encadenado, filtros tras enfoque y títulos en 360px.
- [x] Modificar exclusivamente `Capture.tsx`, `Dialog.tsx`, `Quest.tsx`, `Missions.tsx`, `Rewards.tsx`, `Purposes.tsx`, `app/login/page.tsx`, `app/console.css` y pruebas de navegación relacionadas.
- [x] Mantener elección vacía explícita, foco externo, filtros por cuenta y página, aria-pressed, bloqueo de modos durante solicitudes y títulos de misión legibles con acciones táctiles en segunda fila móvil.
- [x] Verificar tamaños 360/768/1440, navegación por teclado, retorno de enfoque y aislamiento al cambiar de cuenta con datos ficticios.

## 4. Balta — F02, F03, F04

- [x] Probar conservación y resolución de operaciones por cuenta al desmontar/reabrir el panel. Bloquear nuevas consultas mientras existe una pendiente; reintentar conserva ID y cuerpo originales.
- [x] Modificar `ControlDialog.tsx`, añadir unidad de operaciones de texto en memoria y pasar cuenta desde `Quest.tsx` tras coordinar con el frente de interfaz.
- [x] Ocultar instrucciones, autonomía, consentimiento y envío en resúmenes locales. Actualizar consentimientos en `AssistantCapture.tsx`, `AssistantDialog.tsx`, `VoiceDialog.tsx` y `ControlDialog.tsx` para incluir los propósitos enviados.

## 5. Integración y publicación

- [x] Registrar archivos de pruebas nuevos en `package.json`, revisar el diff y solicitar revisión independiente de requisitos y código.
- [x] Ejecutar `node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' run build` y corregir cualquier fallo.
- [x] Retirar fixtures de prueba, comprobar Git, confirmar cambios, integrar en main y publicar en origin conforme a autorización existente.
- [x] Confirmar deploy live del commit funcional, salud 200, lectura privada sin sesión 401 y escritura sin origen 403. Guardar cierre con resultados y límites reales.
