# Preservar avance y contexto Implementation Plan

**Goal:** Corregir los tres puntos prioritarios del informe de uso aprobado mediante «Procede».
**Architecture:** Proteger en editTask el prefijo completado; Capture edita solo pasos pendientes y conserva el prefijo. Quest retorna al detalle al guardar/cancelar edición. Today muestra actual/points para completadas.
**Tech Stack:** Next.js, React, TypeScript, node:test.

- [x] Pruebas de regresión: impedir insertar/reordenar/cambiar/borrar pasos completados; permitir cambiar pendientes y otros campos sin perder progreso. Observar fallo, implementar y ejecutar suite.
- [x] Capture: prefijo completado solo lectura, editor de pendientes; navegación al detalle después de guardar/cancelar.
- [x] Today: tiempo real y recompensa efectivamente concedida después del cierre, estimación solo para pendientes.
- [x] QA local con datos ficticios, revisión independiente y build completo; retirar ruta temporal.
- [x] Preparar publicación en GitHub y comprobación del commit activo en Render y salud del servicio.

Verificación visual local: paso completado Elegir datos conservado, Validar requisitos nuevos pendiente; guardar y cancelar regresan al detalle; tarjeta completada muestra 11 min reales y 20 pts obtenidos. Datos ficticios, sin llamadas a IA ni modificaciones de cuenta. Revisión independiente sin hallazgos importantes. Ruta temporal retirada antes del build final.
