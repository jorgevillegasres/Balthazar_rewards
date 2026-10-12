# Comparación de timbre: Ash

Commit funcional: `9ba90e6f6f1d205599fd194842ab327fcd790b58`.

El usuario sigue percibiendo sonido robótico después de ajustar la entrega conversacional. Se cambia únicamente Cedar por Ash, voz compatible con Realtime. Se conserva modelo, personalidad, español, contexto, perfil, recuerdos, herramientas, turnos, permisos y límites. La entrega ya no menciona Cedar por nombre. No se añadieron dependencias, APIs, proveedor, llamadas de prueba pagadas o almacenamiento.

- La prueba de solicitud saliente falló antes del cambio (`cedar !== ash`).
- `npm run build`: salida 0, **230/230 pruebas**, compilación TypeScript/Next correcta.
- Log externo: `outputs/balthazar-voz-ash-build.log` en el directorio padre.
- Revisión independiente aprobada sin problemas concretos.
- No se escuchó audio real ni se consultaron preferencias privadas del propietario. No hay evidencia de superioridad acústica de Ash sobre Cedar; es una alternativa para una comparación subjetiva en conversación nueva, con el mismo dispositivo.

## Publicación

GitHub main actualizado. Render confirmó **live** para `dep-db645suk1f9s73eumk1g` del mismo commit el 12 de octubre a las 02:17:52 UTC (11 de octubre, 21:17:52, Bogotá). Comprobaciones posteriores: salud 200, estado y voz sin sesión 401, escritura sin Origin 403. No se abrió una sesión de OpenAI. Cierre documental con `[skip render]`.

## Escucha pendiente

Terminar la sesión anterior y abrir otra. Valorar el timbre y la naturalidad por separado del contenido y humor, que no se modificaron en esta entrega. Si la voz no encaja, usar el resultado para elegir otra alternativa; no seguir ajustando solo el prompt ni afirmar que el sonido fue corregido sin esa comprobación.

Fuente: [Realtime voice options](https://developers.openai.com/api/docs/guides/realtime-conversations). Las muestras de [Text to speech](https://developers.openai.com/api/docs/guides/text-to-speech) permiten conocer voces, pero no certifican el sonido de esta sesión Realtime en español.
