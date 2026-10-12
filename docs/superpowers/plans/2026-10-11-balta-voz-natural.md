# Balta: carácter y voz conversacional

El usuario confirmó que la voz resulta poco natural y sin carácter propio. Ajuste acordado: espontaneidad y personalidad reconocible, manteniendo voz masculina, español, humor y ternura. El prompt anterior imponía registro medio-grave y ejemplos teatrales repetibles; su efecto acústico es una hipótesis que necesita escucha real.

Se conserva Cedar, el modelo, la detección de turnos, permisos, contexto, recuerdos y herramientas. Se elimina la gravedad impuesta y los ejemplos guionizados; se refuerzan observaciones concretas, criterio propio, reacción al último mensaje y entonación acorde con su significado. La teatralidad queda como recurso ocasional; no se simulan risas o vacilaciones por obligación. Las preferencias de humor/acompañamiento y pedidos de seriedad siguen prevaleciendo.

La definición compartida está en `lib/balta-personality.ts`; solo la entrega hablada modifica ritmo/expresión. Los tests de `tests/personality.test.mjs` capturan las instrucciones enviadas a Realtime, la voz Cedar, la coherencia con texto y los contratos previos; no certifican calidad acústica.

- [x] Observar regresiones fallidas de voz natural y ausencia de ejemplos teatrales fijos antes de cambiar el prompt.
- [ ] Ajustar instrucciones de personalidad y entrega hablada; conservar límites, memoria y reglas de herramientas.
- [ ] Revisar de forma independiente y ejecutar suite/build.
- [ ] Publicar GitHub, confirmar Render live y comprobar HTTP privado.
- [ ] Registrar resultados y pedir una escucha comparativa en una conversación nueva; no afirmar que el sonido real fue verificado.

Fuente oficial consultada: [Prompting Realtime models](https://developers.openai.com/api/docs/guides/voice-prompting), recomendaciones de brevedad, claridad, variedad y evaluación iterativa de ejemplos.
