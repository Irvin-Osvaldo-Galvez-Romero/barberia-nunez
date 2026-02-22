# Solución: Problema al Actualizar Contraseñas en Supabase

## Problema

No se puede actualizar la contraseña de los empleados porque:

1. Las políticas RLS (Row Level Security) pueden estar bloqueando las actualizaciones
2. La columna `password_hash` tiene restricción `NOT NULL`

## Solución

### Opción 1: Deshabilitar RLS (Para desarrollo/pruebas)

Si no necesitas seguridad adicional, puedes deshabilitar RLS temporalmente:

```sql
-- Deshabilitar RLS en la tabla empleados
ALTER TABLE empleados DISABLE ROW LEVEL SECURITY;
```

**⚠️ ADVERTENCIA**: Esto permite que cualquier persona con la `anon key` pueda modificar datos. Solo úsalo en desarrollo.

### Opción 2: Crear Política RLS para UPDATE (Recomendado)

Si ya tienes RLS habilitado, necesitas crear una política que permita actualizar empleados:

1. Ve a tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Ejecuta este comando:

```sql
-- Verificar si RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'empleados';

-- Si rowsecurity es 'true', RLS está habilitado
-- En ese caso, necesitas crear una política:

-- Política para permitir UPDATE en empleados
CREATE POLICY "Permitir actualizar empleados" ON empleados
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Si la política ya existe, elimínala primero y vuelve a crearla:
DROP POLICY IF EXISTS "Permitir actualizar empleados" ON empleados;
CREATE POLICY "Permitir actualizar empleados" ON empleados
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);
```

### Opción 3: Verificar y Configurar Políticas Completas

Si quieres configurar todas las políticas necesarias para la tabla `empleados`:

```sql
-- 1. Habilitar RLS (si no está habilitado)
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Todos pueden leer empleados" ON empleados;
DROP POLICY IF EXISTS "Todos pueden insertar empleados" ON empleados;
DROP POLICY IF EXISTS "Todos pueden actualizar empleados" ON empleados;
DROP POLICY IF EXISTS "Todos pueden eliminar empleados" ON empleados;

-- 3. Crear nuevas políticas
CREATE POLICY "Todos pueden leer empleados" ON empleados
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden insertar empleados" ON empleados
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar empleados" ON empleados
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Todos pueden eliminar empleados" ON empleados
    FOR DELETE USING (true);
```

## Verificar que Funciona

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla `empleados`
3. Intenta actualizar un empleado manualmente
4. Si funciona, prueba desde la aplicación

## Verificar el Estado Actual

Para ver qué políticas están configuradas:

```sql
-- Ver todas las políticas de la tabla empleados
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'empleados';
```

## Notas Importantes

1. **Seguridad**: Las políticas que usan `USING (true)` permiten acceso total. En producción, deberías crear políticas más restrictivas.
2. **Password Hash**: La contraseña se guarda en la columna `password_hash`. El código ya está configurado para mapear `password` a `password_hash` automáticamente.
3. **Testing**: Después de configurar las políticas, recarga la aplicación y prueba actualizar una contraseña.

## Si Aún No Funciona

1. Verifica que estás usando la `anon key` correcta en `.env`
2. Verifica en la consola del navegador si hay errores
3. Verifica que la columna `password_hash` existe en la tabla:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'empleados' AND column_name = 'password_hash';
   ```
