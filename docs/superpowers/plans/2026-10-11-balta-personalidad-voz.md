# Balta: voz y personalidad — implementación

**Goal:** Darle a Balta la voz y el carácter aprobados, coherentes entre texto y conversación hablada.
**Architecture:** Una unidad de instrucciones compartidas; los adaptadores existentes conservan sus reglas de herramientas y validación.
**Tech Stack:** TypeScript, OpenAI Responses/Realtime, Node test runner, Next/Render.

## 1. Regresiones de configuración

- [x] Crear `tests/personality.test.mjs`, importando los adaptadores actuales `askOpenAI`, `openVoice` y `fresh`.
- [x] Capturar el FormData de una apertura de voz ficticia y comprobar `session.audio.output.voice === 'cedar'`, idioma español, expresividad y los mismos límites/herramientas.
- [x] Capturar las solicitudes de texto en capture/task/day; comprobar que comparten instrucciones de personalidad con voz y que tareas/preguntas siguen claras mediante reglas de canal; el formato mantiene JSON strict y store=false.
- [x] Ejecutar `node --experimental-strip-types --test tests/personality.test.mjs`; observar fallos de voz anterior y ausencia de personalidad.

## 2. Configuración común

- [x] Crear `lib/balta-personality.ts` con `BALTA_VOICE='cedar'` y `personalityInstructions(channel:'text'|'voice')`.
- [x] Incorporar `${personalityInstructions('text')}` como prefijo de `instructions()` en `lib/assistant.ts`, conservando todas las reglas de operación.
- [x] Incorporar `${personalityInstructions('voice')}` y `BALTA_VOICE` en `lib/voice.ts`, conservando permisos, contexto y herramientas.
- [x] Añadir el archivo de pruebas a package.json; comprobar regresiones nuevas y existentes.

## 3. Verificación y publicación

- [x] Pedir revisión independiente de coherencia, alcance, reglas y regresiones.
- [x] Ejecutar npm run build; solo publicar con salida 0.
- [x] Confirmar cambios, integrar sin sobrescribir main, publicar GitHub y comprobar Render live del mismo commit.
- [x] Comprobar salud pública y rechazo de accesos privados sin sesión; documentar que falta audición real y que la voz cambia en sesiones nuevas.
