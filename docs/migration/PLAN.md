# Balthazar: Render y Supabase

Arquitectura acordada: una aplicación Next.js Node en Render, Supabase Auth y PostgreSQL con aislamiento por usuario. El repositorio nuevo es independiente del Site actual.

- [x] Adaptar ejecución a Next.js estándar y eliminar dependencias de Sites.
- [x] Implementar acceso privado con sesión verificada y renovación de cookies.
- [x] Persistencia PostgreSQL con revisión atómica, aislamiento y reintentos idempotentes.
- [x] Exportación e importación versionada con validación y protección del progreso existente.
- [x] Compilar, probar dominio y API, revisar acceso sin sesión y cabeceras falsificadas.
- [ ] Publicar en GitHub, preparar Supabase y desplegar en Render.
- [ ] Verificar despliegue y documentar alta, respaldo y recuperación.

No se importan datos del entorno local de prueba. El estado actual se preserva como JSONB para migrar sin alterar la economía; futuras entidades del OS se separarán cuando se definan.
