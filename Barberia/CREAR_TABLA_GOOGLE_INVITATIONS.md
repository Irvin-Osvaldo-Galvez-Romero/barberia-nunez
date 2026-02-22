# 🔧 Crear Tabla google_calendar_invitations en Supabase

## ⚠️ PROBLEMA IDENTIFICADO
El error `POST 500 - PGRST205: Could not find the table 'public.google_calendar_invitations'` ocurre porque la tabla no existe en la base de datos.

## ✅ SOLUCIÓN

### Opción 1: Dashboard de Supabase (Recomendado)

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto: **barberia-app**
3. En el menú lateral, ve a **SQL Editor**
4. Haz clic en **New Query**
5. Copia TODO el contenido del archivo: `docs/database/crear_tabla_google_invitations.sql`
6. Pega en el editor
7. Haz clic en **Run** (o presiona `Ctrl+Enter`)
8. Espera a que se cree la tabla (sin errores)

### Opción 2: Comando con Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase migration new crear_tabla_google_invitations
# Luego copia el contenido de crear_tabla_google_invitations.sql al archivo generado

# Ejecuta:
supabase db push
```

## 📋 Verificar que la tabla se creó

En el **SQL Editor** de Supabase, ejecuta:

```sql
SELECT * FROM public.google_calendar_invitations;
```

Debería retornar una tabla vacía sin errores.

También puedes ir a **Table Editor** → **google_calendar_invitations** para ver la estructura.

## 🎯 Qué hace esta tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único del registro |
| `barbero_id` | UUID | Referencia al barbero en tabla `empleados` |
| `barbero_email` | TEXT | Email donde se envía la invitación |
| `codigo_invitacion` | TEXT | Código único de 64 caracteres (hexadecimal) |
| `fecha_creacion` | TIMESTAMP | Cuándo se creó el código |
| `fecha_expiracion` | TIMESTAMP | Cuándo expira (48 horas después) |
| `usado` | BOOLEAN | Si ya se usó para vincular Google |
| `fecha_uso` | TIMESTAMP | Cuándo se usó el código |
| `created_at` | TIMESTAMP | Auditoría: creación del registro |
| `updated_at` | TIMESTAMP | Auditoría: última actualización |

## ✨ Características incluidas

- ✅ **Índices** para queries rápidas (barbero_id, código, email, expiración)
- ✅ **Foreign Key** a tabla `empleados` (auto-elimina si se borra el barbero)
- ✅ **Trigger** que actualiza `updated_at` automáticamente
- ✅ **Row Level Security (RLS)** para proteger datos
  - Solo ADMINS pueden ver todas las invitaciones
  - Barberos pueden ver solo sus propias invitaciones
- ✅ **Función de timestamp** para auditoría

## 🧪 Después de crear la tabla

1. Reinicia el backend (si está corriendo)
2. Intenta crear un nuevo BARBERO en la app
3. Deberías recibir un email de invitación en el email del barbero
4. El código de invitación se guardará en la BD

## 🐛 Si algo sale mal

Si ves el error:
```
Error: relation "public.empleados" does not exist
```

Es porque la tabla `empleados` no existe. Necesitarás crear primero la estructura base de la BD. Abre un issue.

Si ves otro error, copia el mensaje de error completo y crea un issue en GitHub.

## 📞 Contacto

Si necesitas ayuda ejecutando el SQL, abre un issue con:
- El error exacto que ves
- Screenshot del Dashboard
- Nombre del proyecto Supabase
