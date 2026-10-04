# Balta voice Implementation Plan

**Goal:** Conversación fluida con contexto actual y activación local opcional Hola Balta.

**Architecture:** WebRTC con configuración autenticada desde Render; funciones limitadas delegan a la asistencia validada existente. El usuario revisa y aplica propuestas con los comandos del dominio. Reconocimiento local optativo, sin fallback remoto.

**Tech Stack:** Next.js, React, OpenAI Realtime, WebRTC, SpeechRecognition local, Supabase RPC existente.

- [x] Escribir pruebas de contexto mínimo, límites y credenciales de cierre, frase de activación y validación del plan; observar fallos antes de implementar.
- [x] Implementar configuración de sesión, apertura autenticada limitada por RPC, cierre autenticado y temporizador de servidor. Limitar salida y duración; documentar que reinicios y fallos del proveedor impiden prometer un límite monetario estricto.
- [x] Implementar transporte WebRTC, interrupciones, transcripciones, cierre de pistas al salir o esconder la página y propuestas editables usando revisión de estado.
- [x] Implementar Hola Balta con processLocally=true, comprobación de soporte/idioma, instalación opcional de paquete oficial del navegador y apagado explícito.
- [x] Probar dominio, controladores y eventos simulados; compilar; comprobar interfaz. No transmitir audio de prueba del usuario sin su intervención.
- [ ] Publicar en GitHub, comprobar Render live, salud y acceso denegado sin sesión. Documentar prueba de audio real pendiente hasta interacción en móvil/computador.
