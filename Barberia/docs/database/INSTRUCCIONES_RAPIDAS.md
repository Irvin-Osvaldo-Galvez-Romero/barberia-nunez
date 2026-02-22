# Instrucciones Rápidas - Conexión a Supabase

## ✅ Credenciales Configuradas

Ya tienes las credenciales configuradas en `frontend/.env`:
- **URL**: https://volelarivkbmikhdqolo.supabase.co
- **Anon Key**: Configurada ✅

## 📋 Pasos Siguientes

### 1. Ejecutar el Script SQL

1. Ve a tu proyecto en Supabase: [https://supabase.com/dashboard/project/volelarivkbmikhdqolo](https://supabase.com/dashboard/project/volelarivkbmikhdqolo)

2. En el panel lateral, ve a **SQL Editor**

3. Click en **New query**

4. Abre el archivo `docs/database/supabase_schema.sql` desde tu proyecto

5. **Copia TODO el contenido** del archivo

6. Pégalo en el editor SQL de Supabase

7. Click en **Run** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

8. Deberías ver el mensaje: **"Success. No rows returned"** ✅

### 2. Verificar las Tablas

1. En el panel lateral de Supabase, ve a **Table Editor**

2. Deberías ver estas 9 tablas:
   - ✅ empleados
   - ✅ clientes
   - ✅ servicios
   - ✅ citas
   - ✅ servicios_citas
   - ✅ horarios
   - ✅ informacion_negocio
   - ✅ configuracion_general
   - ✅ configuracion_notificaciones

### 3. Verificar Datos Iniciales

1. En **Table Editor**, abre la tabla `horarios`
2. Deberías ver 7 filas (uno para cada día de la semana)
3. Abre `informacion_negocio` - debería tener 1 fila
4. Abre `configuracion_general` - debería tener 1 fila
5. Abre `configuracion_notificaciones` - debería tener 1 fila

### 4. Reiniciar la Aplicación

1. Si la aplicación está corriendo, deténla (`Ctrl+C`)

2. Reinicia la aplicación:
   ```bash
   npm run dev
   ```

3. La aplicación ahora debería conectarse a Supabase en lugar del modo demo

## ⚠️ Importante

- La **service_role key** que recibiste es muy poderosa y **NO debe usarse en el frontend**
- Solo se usa la **anon key** en el frontend (ya está configurada)
- Guarda la **service_role key** en un lugar seguro por si la necesitas más adelante para operaciones de backend

## 🔍 Verificar la Conexión

Para verificar que la conexión funciona:

1. Inicia la aplicación
2. Inicia sesión (deberías ver los datos de Supabase, no los datos demo)
3. Si ves datos, ¡la conexión funciona! ✅

## 📝 Nota sobre Datos Demo

Cuando la aplicación se conecte a Supabase, verás que las tablas están vacías (excepto los datos iniciales). Esto es normal. Los datos demo están solo en el código y no se sincronizan con Supabase.

Para agregar datos de prueba, puedes:
1. Usar la interfaz de la aplicación
2. O ejecutar comandos SQL (ver `docs/database/comandos_rapidos.md`)

## ❓ Problemas Comunes

### Error: "relation does not exist"
- **Solución**: Asegúrate de haber ejecutado el script SQL completo

### Error: "permission denied"
- **Solución**: Verifica que estás usando la anon key correcta (ya está configurada)

### La aplicación sigue usando modo demo
- **Solución**: 
  1. Verifica que el archivo `.env` existe en `frontend/`
  2. Verifica que las credenciales están correctas
  3. Reinicia el servidor de desarrollo

### No se ven las tablas
- **Solución**: Ve a **Table Editor** en Supabase y verifica que las tablas se crearon
