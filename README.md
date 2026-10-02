# Balthazar

Espacio personal de misiones, enfoque y recompensas. PWA privada con Next.js, Render y Supabase. No requiere ChatGPT para iniciar sesión ni guardar datos.

## Desarrollo

Node 22.13 o superior. `npm ci`, copiar `.env.example` a `.env.local`, completar configuración y ejecutar `npm run dev`. `npm test`, `npm run typecheck` y `npm run build` verifican la aplicación. `npm start` escucha en `0.0.0.0` y utiliza `PORT`.

## Acceso

Configurar `BALTHAZAR_OWNER_EMAIL` y el mismo correo en `balthazar_allowed_emails`. El servidor verifica la sesión con Supabase Auth. PostgreSQL aplica RLS por identidad y propietario. No se utilizan claves administrativas en la aplicación ni se aceptan cabeceras de autenticación de ChatGPT.

Antes del primer acceso, configurar las plantillas **Confirm signup** y **Magic Link** de Supabase Auth para incluir `{{ .Token }}`. Balthazar permite crear acceso con contraseña y confirmar mediante código. Recuperación: solicitar código por correo e introducirlo en la pantalla de acceso. No es necesario configurar un proveedor OAuth. Usar SMTP propio cuando las limitaciones del correo de desarrollo no sean suficientes.

## Despliegue y datos

Render ejecuta `npm ci && npm run build` y `npm start`; `/api/health` comprueba el proceso. El archivo `render.yaml` reproduce la configuración. Las claves publishable son públicas por diseño; nunca colocar secret/service_role en NEXT_PUBLIC ni en Git.

El estado se conserva en JSONB por usuario para trasladar sin alterar reglas existentes. Una actualización atómica condicionada por revisión evita sobrescrituras concurrentes. Las órdenes conservan sus identificadores para evitar cobros o capturas repetidos.

En Perfil se descarga un respaldo JSON versionado, que puede importarse únicamente en un espacio sin actividad. Los respaldos contienen información personal: almacenarlos cifrados fuera de Render y del repositorio. La base de datos persiste en Supabase y no depende del disco efímero de Render. El respaldo manual de Perfil no sustituye una política automatizada de respaldo; habilitar recuperación/backup según el plan de Supabase y ensayar restauración en un proyecto separado.

La PWA requiere conexión. No almacena datos privados en el service worker. Render Free puede suspender el proceso por inactividad; el primer acceso puede tardar. El temporizador se calcula mediante marcas de tiempo y no depende de que el proceso permanezca activo.

Las fuentes Barlow Condensed, DM Sans e IBM Plex Mono se sirven desde `/fonts` con sus licencias. La aplicación no solicita fuentes a Google durante el uso.

## Migración desde Sites

Usar el exportador de la instalación anterior autenticado como propietario, descargar el JSON e importarlo en esta instalación después de crear el acceso. No copiar datos de pruebas locales. Mantener la instalación anterior hasta verificar tareas, saldo, historial y foco desde teléfono y computador. La instalación como PWA debe repetirse para el nuevo dominio.
