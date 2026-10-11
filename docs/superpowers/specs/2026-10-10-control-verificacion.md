# Verificación del centro de control

Fecha local: 10 de octubre de 2026.

- Copia privada de estado, fuera del repositorio, previa a cambios: un espacio, 36 tareas y 6 proyectos. No incluye binarios de Storage. Las pruebas no modifican ese estado de producción.
- Pruebas del dominio y repositorio: propósitos, vínculos, archivo sin cascada, métricas de principales, respaldo antiguo/nuevo, recibos con referencias válidas, conflictos, idempotencia y comprobantes acotados.
- Pruebas del ejecutor: autenticación/origen, revisión vencida sin consumo, persistencia previa, cuotas, recuperación por ID y modelo sin autoridad para escribir.
- Pruebas de deshacer: avance, sesiones, soportes, relaciones, plan y carga con reserva de revisión. Archivar conserva información; no restaura un estado completo ni borra progreso posterior.
- Interfaz local con Quest y transportes simulados: vínculo confirmado y métricas actualizadas; captura automática con instrucción explícita; Actividad con comprobante y Deshecha después de revertir; saldo sin cambios. Consola sin errores ni advertencias.
- Ancho móvil: contenido 375 px sobre viewport de 375 px, sin desbordamiento horizontal; navegación, centro de mando y actividad visibles.
- Nueva tabla: RLS habilitada, tres políticas de propietario/correo, sin SELECT para anon. Prueba transaccional sin identidad rechaza inserción y no expone filas; rollback sin crear datos.
- Advisor de seguridad: no hallazgos de la tabla nueva. Existe un aviso previo de Supabase Auth sobre [protección de contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), independiente de estas funciones.
- Las llamadas al proveedor y el audio reales no se han probado en esta verificación. El modelo requiere facturación activa, micrófono y consentimiento. No confundir pruebas simuladas con aceptación de voz real.

Las fechas de los nombres de migración fueron generadas por Supabase CLI en UTC; la fecha del trabajo es la local indicada arriba.
