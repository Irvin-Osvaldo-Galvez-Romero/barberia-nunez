# 🔐 Cómo Iniciar Sesión en la App

## 📋 Dos Modos Disponibles

### 🎭 Modo 1: Modo Demo (Sin Supabase)

**Para probar la interfaz sin configurar base de datos:**

1. **La app detecta automáticamente** que Supabase no está configurado
2. **Se muestra una pantalla de selección de rol**
3. **Selecciona el rol que quieres probar:**
   - **Administrador** - Acceso completo
   - **Barbero** - Ver citas y servicios
   - **Recepcionista** - Gestionar citas y clientes
4. **Haz clic en "Entrar"**
5. **¡Listo!** Estarás dentro del sistema en modo demo

**Nota:** En modo demo, los datos no se guardan realmente, pero puedes ver toda la interfaz y navegar.

---

### 🗄️ Modo 2: Con Supabase (Funcionalidad Completa)

**Para usar la app con base de datos real:**

#### Paso 1: Configurar Supabase

1. **Crea un proyecto en Supabase:**
   - Ve a [https://supabase.com](https://supabase.com)
   - Crea una cuenta o inicia sesión
   - Crea un nuevo proyecto

2. **Obtén tus credenciales:**
   - En tu proyecto, ve a **Settings > API**
   - Copia la **URL** y la **anon key**

3. **Configura el archivo `.env`:**
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
   ```

4. **Ejecuta el script SQL:**
   - Ve a `docs/SETUP.md`
   - Copia el script SQL completo
   - En Supabase, ve a **SQL Editor**
   - Pega y ejecuta el script

#### Paso 2: Crear Usuario

1. **En Supabase, ve a Authentication > Users**
2. **Crea un nuevo usuario:**
   - Email: `admin@barberia.com` (o el que prefieras)
   - Password: `admin123` (o la que prefieras)
   - **Anota el UUID del usuario** (lo necesitarás después)

3. **Crea el empleado y usuario en la base de datos:**

   Ve a **SQL Editor** y ejecuta:

   ```sql
   -- Insertar empleado
   INSERT INTO empleados (nombre, email, rol, porcentaje_comision)
   VALUES ('Administrador', 'admin@barberia.com', 'ADMINISTRADOR', 0)
   RETURNING id;

   -- Insertar usuario (reemplaza 'USER_ID_AQUI' con el UUID del usuario de auth)
   INSERT INTO usuarios (id, empleado_id, username, rol)
   VALUES (
     'USER_ID_AQUI', -- Reemplaza con el UUID del usuario de auth
     (SELECT id FROM empleados WHERE email = 'admin@barberia.com'),
     'admin',
     'ADMINISTRADOR'
   );
   ```

#### Paso 3: Iniciar Sesión

1. **Reinicia la aplicación** (Ctrl+C y luego `npm run dev`)
2. **Verás la pantalla de login normal** (no la de demo)
3. **Ingresa tus credenciales:**
   - Email: `admin@barberia.com`
   - Password: `admin123`
4. **Haz clic en "Iniciar sesión"**
5. **¡Listo!** Estarás autenticado con funcionalidad completa

---

## 🔄 Cambiar Entre Modos

### De Demo a Real:
1. Configura Supabase en `.env`
2. Reinicia la app (`npm run dev`)
3. La app detectará automáticamente Supabase y mostrará login real

### De Real a Demo:
1. Vacía o elimina las variables de `.env`
2. Reinicia la app
3. La app mostrará automáticamente el modo demo

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar ambos modos?
Sí, la app detecta automáticamente si Supabase está configurado o no.

### ¿Los datos del modo demo se guardan?
No, el modo demo es solo para ver la interfaz. Los datos no se persisten.

### ¿Puedo crear múltiples usuarios en modo demo?
No, en modo demo solo puedes seleccionar un rol por sesión. Para múltiples usuarios, configura Supabase.

### ¿Cómo salgo del modo demo?
Haz clic en "Cerrar sesión" en el menú lateral, o reinicia la app.

---

## 🐛 Problemas Comunes

### "No puedo iniciar sesión en modo real"
- Verifica que las credenciales en `.env` sean correctas
- Verifica que el usuario exista en Supabase Authentication
- Verifica que el usuario esté vinculado en la tabla `usuarios`

### "Sigue mostrando modo demo"
- Verifica que el archivo `.env` tenga las variables correctas
- Reinicia la aplicación completamente
- Verifica que no haya espacios en las variables

---

¿Necesitas ayuda? Revisa `docs/SETUP.md` para más detalles sobre la configuración de Supabase.
