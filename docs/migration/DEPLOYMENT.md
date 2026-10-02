# Instalación de Balthazar

- Repositorio: https://github.com/jorgevillegasres/Balthazar_rewards
- Aplicación: https://balthazar-rewards.onrender.com
- Render: https://dashboard.render.com/web/srv-davj479srm7s73c766rg
- Supabase: https://supabase.com/dashboard/project/wfhyememfkhssbllrtrf

Render usa Node 22, plan Free, región Ohio y despliegue automático desde main. Variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY y BALTHAZAR_OWNER_EMAIL. Se configuraron en Render; no se almacenan credenciales privadas en el repositorio. La base usa RLS y permisos mínimos para usuario autenticado.

## Alta inicial

Configurar `BALTHAZAR_APP_ORIGIN=https://balthazar-rewards.onrender.com` en Render. Es el origen público permitido para formularios y escrituras; el servidor no confía en encabezados de proxy suministrados por el cliente. Si se cambia de dominio, actualizar esta variable antes de usarlo.

Supabase exige un SMTP propio para editar y guardar las plantillas. Configurarlo primero en Authentication → Email → SMTP Settings.

En Supabase → Authentication → Email → Templates, incluir `{{ .Token }}` en Confirm signup y Magic Link. Después abrir `/login`, pulsar «Primera vez: crear mi acceso», introducir el correo autorizado y una contraseña de 12 caracteres o más y confirmar el código recibido por correo. El propietario elige su contraseña directamente en la aplicación.

## Traslado del progreso

En la instalación anterior abrir Perfil → Descargar respaldo. En la nueva instalación, antes de crear tareas, abrir Perfil → Respaldo y traslado → Importar en este espacio. Verificar saldo, misiones, proyectos, historial y sesión de enfoque pausada. La importación rechaza archivos incompatibles y espacios con actividad existente.

## Operación

Crear tareas y entrar con la misma cuenta desde el teléfono y computador. Instalar la PWA desde el nuevo dominio. Descargar respaldos periódicos desde Perfil y guardarlos cifrados fuera del proveedor. Para restaurar, crear una instalación vacía con el mismo esquema y propietario e importar el archivo. Una restauración de PostgreSQL de producción debe ensayarse primero en otro proyecto.

El plan Free de Render puede suspender el proceso por inactividad y causar demora al primer acceso. No se contrató un servicio pagado ni un sistema de respaldos automáticos. La revisión de cuenta/plan de Supabase y la estrategia automática de respaldo quedan como decisiones operativas antes de almacenar información crítica.
