# Personalización y recuerdos de Balta — implementación

**Goal:** Conservar únicamente el perfil y los recuerdos que el usuario eligió guardar, con controles de revisión y borrado.
**Architecture:** Estado JSON privado y comandos existentes con CAS; contexto de IA opcional; voz propone borradores sin guardar automáticamente.
**Tech Stack:** TypeScript/Zod, React, Next, Node test runner, Supabase y Render.

- [x] Dominio: implementar contratos del diseño en `lib/balta-profile.ts`, `app/lib/domain.ts`, `lib/backup.ts`, `lib/state-repository.ts`; pruebas de guardado/confirmación/capacidad/CAS/respaldo/aislamiento antes de los cambios.
- [x] Perfil: añadir `BaltaSettings.tsx` y conectarlo a `Profile.tsx`. Mantener paneles separados, controles accesibles, editor y confirmación de borrado; usar comandos del diseño, límites y estado guardado del propietario.
- [x] Voz: añadir herramienta `remember_information` con entrada `{text:string}`; reconocer peticiones explícitas del turno, generar borrador revisable sin endpoint de harness, extender draft de voz y guardar únicamente con botón. Actualizar contexto, avisos, reglas, cuotas comunicadas y pruebas.
- [x] Texto: incorporar personalización opcional al contexto, adaptar las reglas de personalidad a preferencias declaradas y actualizar consentimientos; probar contratos sin permitir nuevas herramientas.
- [x] Integración: registrar pruebas, comprobar el diff y pedir revisión independiente de datos, contexto, confirmaciones y ciclo de voz.
- [x] Verificación: navegador ficticio con creación/edición/borrado y exclusión de contexto, tamaños 360/768/1440, suite y build.
- [x] Publicación: retirar fixtures, integrar GitHub, comprobar Render live y HTTP privado, cerrar documentación con resultados reales y límites de la prueba.
