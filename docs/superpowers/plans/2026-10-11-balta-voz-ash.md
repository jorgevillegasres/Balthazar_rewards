# Comparación de timbre de Balta

El usuario confirma que también el sonido de la voz resulta robótico después del ajuste conversacional. Se cambia únicamente la voz base de Cedar a Ash, manteniendo modelo, personalidad, entrega natural, español, herramientas, contexto, memoria y permisos. Ash figura entre las voces disponibles en [Realtime](https://developers.openai.com/api/docs/guides/realtime-conversations). Su idoneidad y naturalidad percibida son una hipótesis de prueba, no una calidad demostrada ni superioridad garantizada sobre Cedar.

- [x] Reproducir la solicitud de voz anterior mediante el transporte ficticio de `tests/personality.test.mjs`, esperando Ash.
- [x] Cambiar `BALTA_VOICE` a ash y quitar la mención del timbre Cedar en la entrega sin cambiar reglas de personalidad.
- [x] Verificar pruebas/build y revisión independiente; publicar GitHub y confirmar commit live en Render.
- [x] Registrar HTTP y pedir comparar en una conversación nueva, con el mismo dispositivo. No declarar que se escuchó audio real.
