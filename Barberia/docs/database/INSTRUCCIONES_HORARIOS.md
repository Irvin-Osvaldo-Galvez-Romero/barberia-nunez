# Instrucciones para Crear la Tabla horarios_negocio en Supabase

## Error Encontrado
```
Could not find the table 'public.horarios_negocio' in the schema cache
```

Este error indica que la tabla `horarios_negocio` no existe en tu base de datos de Supabase.

## Solución

### Opción 1: Usando el SQL Editor de Supabase (Recomendado)

1. **Abre tu proyecto en Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en **"SQL Editor"**
   - Haz clic en **"New query"**

3. **Ejecuta el script SQL**
   - Copia todo el contenido del archivo `CREAR_TABLA_HORARIOS.sql`
   - Pega el contenido en el editor SQL
   - Haz clic en **"Run"** o presiona `Ctrl + Enter` (Windows/Linux) o `Cmd + Enter` (Mac)

4. **Verifica que la tabla se creó**
   - En el menú lateral, ve a **"Table Editor"**
   - Deberías ver la tabla `horarios_negocio` en la lista

### Opción 2: Deshabilitar RLS temporalmente (Solo para desarrollo)

Si tienes problemas con las políticas RLS, puedes deshabilitarlas temporalmente:

```sql
-- Deshabilitar RLS (solo para desarrollo)
ALTER TABLE public.horarios_negocio DISABLE ROW LEVEL SECURITY;
```

**⚠️ ADVERTENCIA**: Solo haz esto en desarrollo. En producción, siempre usa RLS.

### Opción 3: Crear la tabla manualmente

Si prefieres crear la tabla paso a paso:

1. **Crea la tabla base:**
```sql
CREATE TABLE IF NOT EXISTS public.horarios_negocio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_apertura TIME NOT NULL,
  hora_cierre TIME NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(dia_semana)
);
```

2. **Crea los índices:**
```sql
CREATE INDEX IF NOT EXISTS idx_horarios_negocio_dia_semana ON public.horarios_negocio(dia_semana);
CREATE INDEX IF NOT EXISTS idx_horarios_negocio_activo ON public.horarios_negocio(activo);
```

3. **Habilita RLS:**
```sql
ALTER TABLE public.horarios_negocio ENABLE ROW LEVEL SECURITY;
```

4. **Crea las políticas RLS** (ver el archivo `CREAR_TABLA_HORARIOS.sql` para las políticas completas)

5. **Inserta los datos por defecto:**
```sql
INSERT INTO public.horarios_negocio (dia_semana, hora_apertura, hora_cierre, activo)
VALUES
  (1, '09:00:00', '18:00:00', true),  -- Lunes
  (2, '09:00:00', '18:00:00', true),  -- Martes
  (3, '09:00:00', '18:00:00', true),  -- Miércoles
  (4, '09:00:00', '18:00:00', true),  -- Jueves
  (5, '09:00:00', '18:00:00', true),  -- Viernes
  (6, '09:00:00', '16:00:00', true)   -- Sábado
ON CONFLICT (dia_semana) DO NOTHING;
```

## Estructura de la Tabla

La tabla `horarios_negocio` tiene la siguiente estructura:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Identificador único (clave primaria) |
| `dia_semana` | VARCHAR(20) | Día de la semana ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') |
| `hora_apertura` | TIME | Hora de apertura (formato HH:MM:SS) |
| `hora_cierre` | TIME | Hora de cierre (formato HH:MM:SS) |
| `activo` | BOOLEAN | Indica si el día está activo (true/false) |
| `created_at` | TIMESTAMP | Fecha de creación del registro |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

## Notas Importantes

1. **Días de la semana**: 
   - 'LUNES' = Lunes
   - 'MARTES' = Martes
   - 'MIERCOLES' = Miércoles
   - 'JUEVES' = Jueves
   - 'VIERNES' = Viernes
   - 'SABADO' = Sábado
   - 'DOMINGO' = Domingo

2. **Horarios por defecto**: El script inserta horarios de ejemplo. Puedes modificarlos según las necesidades de tu negocio.

3. **RLS (Row Level Security)**: Las políticas RLS están configuradas para que solo los administradores puedan modificar los horarios, pero todos los usuarios autenticados pueden leerlos.

4. **Actualización automática**: El trigger `update_horarios_negocio_updated_at` actualiza automáticamente el campo `updated_at` cuando se modifica un registro.

## Verificación

Después de ejecutar el script, verifica que todo esté correcto:

1. **Verifica que la tabla existe:**
```sql
SELECT * FROM public.horarios_negocio;
```

2. **Deberías ver 6 registros** (uno para cada día de la semana, excepto domingo por defecto)

3. **Prueba la aplicación**: Recarga tu aplicación y verifica que el módulo de Configuración funciona correctamente.

## Solución de Problemas

### Error: "permission denied for table horarios_negocio"
**Solución**: Verifica que las políticas RLS estén creadas correctamente. Si estás en desarrollo, puedes deshabilitar RLS temporalmente.

### Error: "duplicate key value violates unique constraint"
**Solución**: Esto es normal si ya existe un registro para ese día. El script usa `ON CONFLICT DO NOTHING` para evitar este error.

### La tabla no aparece en el Table Editor
**Solución**: 
1. Refresca la página del Table Editor
2. Verifica que ejecutaste el script completo
3. Verifica que estás en el esquema correcto (`public`)
