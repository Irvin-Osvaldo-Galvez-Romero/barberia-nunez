# Guía de Configuración de Supabase

Esta guía te ayudará a configurar Supabase para la aplicación de barbería.

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Click en "New Project"
4. Completa el formulario:
   - **Name**: Barbería (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la región más cercana a ti
   - **Pricing Plan**: Free tier es suficiente para empezar
5. Click en "Create new project"
6. Espera 1-2 minutos mientras se crea el proyecto

## Paso 2: Obtener las Credenciales

1. En el panel de Supabase, ve a **Settings** → **API**
2. Encontrarás las siguientes credenciales:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: La clave pública (anon key)
   - **service_role key**: La clave de servicio (¡manténla secreta!)

## Paso 3: Ejecutar el Script SQL

1. En el panel de Supabase, ve a **SQL Editor**
2. Click en **New query**
3. Abre el archivo `docs/database/supabase_schema.sql`
4. Copia todo el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Click en **Run** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
7. Verifica que aparezca el mensaje "Success. No rows returned"

## Paso 4: Configurar Variables de Entorno

1. En la raíz del proyecto, crea o edita el archivo `.env` en la carpeta `frontend`:

```bash
# .env en frontend/
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

2. Reemplaza los valores con tus credenciales reales de Supabase

## Paso 5: Configurar Row Level Security (RLS) - Opcional pero Recomendado

Si quieres seguridad adicional, puedes configurar políticas RLS. Ejecuta este script en el SQL Editor:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE informacion_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_general ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo para usuarios autenticados)
-- Puedes ajustar estas políticas según tus necesidades de seguridad

CREATE POLICY "Todos pueden leer empleados" ON empleados
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer clientes" ON clientes
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer servicios" ON servicios
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer citas" ON citas
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer servicios_citas" ON servicios_citas
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer horarios" ON horarios
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer informacion_negocio" ON informacion_negocio
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer configuracion_general" ON configuracion_general
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden leer configuracion_notificaciones" ON configuracion_notificaciones
    FOR SELECT USING (true);

-- Para escritura, puedes crear políticas más restrictivas
-- Por ahora, permitimos todo (ajusta según tus necesidades)

CREATE POLICY "Todos pueden insertar empleados" ON empleados
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar empleados" ON empleados
    FOR UPDATE USING (true);

CREATE POLICY "Todos pueden insertar clientes" ON clientes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar clientes" ON clientes
    FOR UPDATE USING (true);

CREATE POLICY "Todos pueden insertar servicios" ON servicios
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar servicios" ON servicios
    FOR UPDATE USING (true);

CREATE POLICY "Todos pueden insertar citas" ON citas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar citas" ON citas
    FOR UPDATE USING (true);

CREATE POLICY "Todos pueden insertar servicios_citas" ON servicios_citas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar servicios_citas" ON servicios_citas
    FOR UPDATE USING (true);
```

## Paso 6: Crear Usuario Administrador (Opcional)

Para crear un usuario administrador directamente en la base de datos:

```sql
-- Insertar empleado administrador
-- NOTA: Deberás encriptar la contraseña con bcrypt antes de insertarla
-- Por ahora, puedes usar el sistema de autenticación de Supabase
INSERT INTO empleados (nombre, email, rol, activo, password_hash) VALUES
    ('Admin', 'admin@barberia.com', 'ADMINISTRADOR', true, 'temp_hash')
ON CONFLICT (email) DO NOTHING;
```

**Importante**: Para producción, usa Supabase Auth para la autenticación de usuarios.

## Paso 7: Verificar la Instalación

1. Ve a **Table Editor** en Supabase
2. Deberías ver todas las tablas creadas:
   - empleados
   - clientes
   - servicios
   - citas
   - servicios_citas
   - horarios
   - informacion_negocio
   - configuracion_general
   - configuracion_notificaciones

3. Verifica que las tablas `horarios`, `informacion_negocio`, `configuracion_general`, y `configuracion_notificaciones` tengan datos iniciales

## Paso 8: Reiniciar la Aplicación

1. En la terminal, detén la aplicación si está corriendo (`Ctrl+C`)
2. Reinicia la aplicación:
   ```bash
   npm run dev
   ```

## Comandos Útiles

### Ver todas las tablas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Ver estructura de una tabla
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'citas';
```

### Eliminar todas las tablas (¡CUIDADO!)
```sql
DROP TABLE IF EXISTS servicios_citas CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS empleados CASCADE;
DROP TABLE IF EXISTS horarios CASCADE;
DROP TABLE IF EXISTS informacion_negocio CASCADE;
DROP TABLE IF EXISTS configuracion_general CASCADE;
DROP TABLE IF EXISTS configuracion_notificaciones CASCADE;
```

## Solución de Problemas

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el script SQL completo
- Verifica que estás conectado a la base de datos correcta

### Error: "permission denied"
- Verifica que estás usando la `anon key` correcta
- Si usaste RLS, verifica que las políticas permitan la operación

### La aplicación no se conecta
- Verifica que las variables de entorno están correctamente configuradas
- Asegúrate de que el archivo `.env` esté en la carpeta `frontend`
- Reinicia el servidor de desarrollo después de cambiar `.env`

## Siguiente Paso

Una vez configurado, deberás actualizar los stores para usar Supabase en lugar del modo demo. Por ahora, la aplicación funcionará en modo demo si no encuentra las variables de entorno de Supabase.
