## Crear Tabla google_calendar_invitations en Supabase

### Problema
El endpoint `/api/google/generar-invitacion` falla porque la tabla `public.google_calendar_invitations` no existe en la base de datos.

### Solución

#### Opción 1: Editor SQL de Supabase (Recomendado)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto "barberia"
3. Ve a **SQL Editor** en el menú izquierdo
4. Haz clic en **"New Query"**
5. Copia y pega el contenido de `docs/database/crear_tabla_google_invitations.sql`
6. Haz clic en **"Run"**

#### Opción 2: Usar el Cliente Supabase desde Terminal

```bash
# Desde la carpeta del proyecto
cd backend

# Crear la tabla con el archivo SQL
npx supabase db push docs/database/crear_tabla_google_invitations.sql
```

### Verificar que se creó la tabla

```bash
# En Supabase Dashboard → SQL Editor, ejecuta:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'google_calendar_invitations';
```

Deberías ver una fila con `google_calendar_invitations`.

### Qué hace esta tabla

- **id**: Identificador único (UUID)
- **barbero_id**: Referencia al empleado (barbero)
- **barbero_email**: Email del barbero para el envío de correos
- **codigo_invitacion**: Código único de 64 caracteres hexadecimales
- **fecha_creacion**: Cuándo se generó la invitación
- **fecha_expiracion**: Cuándo expira (48 horas después)
- **usado**: Si ya fue utilizado
- **created_at / updated_at**: Timestamps automáticos

### Después de crear la tabla

El endpoint `/api/google/generar-invitacion` debería funcionar correctamente:

```bash
# Probar con curl
curl -X POST http://localhost:3001/api/google/generar-invitacion \
  -H "Content-Type: application/json" \
  -d '{
    "barberoId": "uuid-del-barbero",
    "barberoEmail": "barbero@example.com",
    "nombreBarbero": "Juan"
  }'
```

### Verificar conexión a Gmail

Si la tabla se crea pero aún hay error 500, verifica que Gmail esté configurado:

```bash
# Probar estado de Gmail
curl http://localhost:3001/api/google/status
```

Deberías obtener una respuesta con la configuración de Gmail.
