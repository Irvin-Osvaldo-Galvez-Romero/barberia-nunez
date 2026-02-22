# Cómo Crear Usuarios en Supabase

Si estás usando Supabase (no modo demo), necesitas crear usuarios en tu base de datos. Hay dos formas de hacerlo:

## 🔐 Método 1: Crear Usuarios con Supabase Auth (Recomendado)

Este es el método recomendado porque usa la autenticación segura de Supabase.

### Paso 1: Crear Usuario en Supabase Auth

1. Ve a tu proyecto en Supabase: [https://supabase.com/dashboard/project/volelarivkbmikhdqolo](https://supabase.com/dashboard/project/volelarivkbmikhdqolo)
2. En el menú lateral, ve a **Authentication** → **Users**
3. Click en **Add user** → **Create new user**
4. Completa el formulario:
   - **Email:** `admin@barberia.com`
   - **Password:** (elige una contraseña segura, ej: `Admin123!`)
   - **Auto Confirm User:** ✅ Activa esta opción (para que no necesite verificación por email)
5. Click en **Create user**

Repite este proceso para crear un usuario barbero:
- **Email:** `barbero@barberia.com`
- **Password:** (elige una contraseña, ej: `Barbero123!`)
- **Auto Confirm User:** ✅ Activa

### Paso 2: Crear Registros en la Tabla `empleados`

Después de crear los usuarios en Auth, necesitas crear los registros correspondientes en la tabla `empleados`:

1. En Supabase, ve a **Table Editor** → **empleados**
2. Click en **Insert** → **Insert row**
3. Crea un registro para el administrador:
   - **nombre:** "Administrador"
   - **email:** `admin@barberia.com` (DEBE coincidir con el email del usuario en Auth)
   - **rol:** `ADMINISTRADOR`
   - **telefono:** (opcional)
   - **fecha_contratacion:** (fecha actual)
   - **activo:** ✅ true
   - **password_hash:** (deja vacío, no se usa en Supabase Auth)

4. Repite para crear un registro de barbero:
   - **nombre:** "Barbero Principal"
   - **email:** `barbero@barberia.com` (DEBE coincidir con el email del usuario en Auth)
   - **rol:** `BARBERO`
   - **telefono:** (opcional)
   - **fecha_contratacion:** (fecha actual)
   - **activo:** ✅ true
   - **porcentaje_comision:** 40 (ejemplo)
   - **especialidad:** "Corte + Barba" (opcional)
   - **password_hash:** (deja vacío)

### Paso 3: Iniciar Sesión

Ahora puedes iniciar sesión en la aplicación con:
- **Email:** `admin@barberia.com`
- **Password:** (la contraseña que configuraste en Auth)

---

## 🗄️ Método 2: Crear Usuarios Directamente en la Tabla (No recomendado)

Si prefieres crear usuarios directamente en la tabla sin usar Supabase Auth, necesitarías modificar el código de autenticación. Este método NO es recomendado para producción.

---

## 📝 Resumen Rápido

1. **Crear usuarios en Supabase Auth:**
   - Ve a Authentication → Users → Add user
   - Crea: `admin@barberia.com` y `barbero@barberia.com`
   - Activa "Auto Confirm User"

2. **Crear registros en tabla `empleados`:**
   - Ve a Table Editor → empleados
   - Crea registros con los mismos emails
   - Rol: `ADMINISTRADOR` para admin, `BARBERO` para barbero

3. **Iniciar sesión:**
   - Usa los emails y contraseñas configurados en Auth

---

## ⚠️ Notas Importantes

- El **email** en la tabla `empleados` DEBE coincidir exactamente con el email en Supabase Auth
- El campo `password_hash` en la tabla `empleados` no se usa cuando usas Supabase Auth
- Asegúrate de activar "Auto Confirm User" para evitar verificación por email
- Los roles en la tabla deben ser: `ADMINISTRADOR`, `BARBERO`, o `RECEPCIONISTA`

---

## 🔧 Comandos SQL (Opcional)

Si prefieres usar SQL directamente, puedes ejecutar estos comandos en **SQL Editor**:

```sql
-- Crear registro de administrador en la tabla empleados
-- NOTA: Primero debes crear el usuario en Supabase Auth manualmente
INSERT INTO empleados (nombre, email, rol, fecha_contratacion, activo)
VALUES ('Administrador', 'admin@barberia.com', 'ADMINISTRADOR', CURRENT_DATE, true);

-- Crear registro de barbero
INSERT INTO empleados (nombre, email, rol, fecha_contratacion, activo, porcentaje_comision, especialidad)
VALUES ('Barbero Principal', 'barbero@barberia.com', 'BARBERO', CURRENT_DATE, true, 40, 'Corte + Barba');
```

**Recuerda:** Estos comandos SQL solo crean los registros en la tabla. Aún necesitas crear los usuarios en Supabase Auth (Método 1, Paso 1).
