# 🚀 Guía para Previsualizar la App de Escritorio

## 📋 Requisitos Previos

1. **Node.js 18+** instalado
2. **Cuenta de Supabase** creada (opcional para probar, pero necesario para funcionalidad completa)

---

## 🔧 Paso 1: Instalar Dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias (puede tardar unos minutos la primera vez).

---

## ⚙️ Paso 2: Configurar Variables de Entorno

### Opción A: Sin Supabase (Solo para ver la interfaz)

Si solo quieres ver la interfaz sin conectarte a la base de datos, puedes crear un archivo `.env` con valores vacíos:

```bash
# En la raíz del proyecto, crea un archivo .env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Nota:** Con esto podrás ver la interfaz pero no podrás hacer login ni usar las funcionalidades.

### Opción B: Con Supabase (Funcionalidad completa)

1. **Crea un proyecto en Supabase:**
   - Ve a [https://supabase.com](https://supabase.com)
   - Crea una cuenta o inicia sesión
   - Crea un nuevo proyecto

2. **Obtén tus credenciales:**
   - En tu proyecto de Supabase, ve a **Settings > API**
   - Copia la **URL del proyecto** y la **anon key**

3. **Crea el archivo `.env` en la raíz del proyecto:**
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
   ```

4. **Configura la base de datos:**
   - Ve a `docs/SETUP.md` para ver el script SQL completo
   - En Supabase, ve a **SQL Editor**
   - Ejecuta el script SQL para crear las tablas

---

## 🎬 Paso 3: Ejecutar la Aplicación

En la terminal, ejecuta:

```bash
npm run dev
```

Este comando:
1. Compila el código de Electron
2. Inicia el servidor de desarrollo de Vite (React) en `http://localhost:5173`
3. Espera a que el servidor esté listo
4. Abre la ventana de Electron con la aplicación

**⏱️ Tiempo estimado:** 10-30 segundos la primera vez

---

## 🖥️ Qué Verás

1. **Ventana de Electron** se abrirá automáticamente
2. **Pantalla de Login** (si no estás autenticado)
3. **DevTools** abierto (puedes cerrarlo con `Ctrl+Shift+I` o `F12`)

---

## 🔐 Paso 4: Iniciar Sesión (Si configuraste Supabase)

### Crear un Usuario de Prueba

1. **En Supabase, ve a Authentication > Users**
2. **Crea un nuevo usuario:**
   - Email: `admin@barberia.com`
   - Password: `admin123` (o la que prefieras)

3. **Crea el empleado y usuario en la base de datos:**

   Ve a SQL Editor en Supabase y ejecuta:

   ```sql
   -- Primero, obtén el ID del usuario que acabas de crear
   -- Ve a Authentication > Users y copia el UUID del usuario

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

4. **Inicia sesión en la app:**
   - Email: `admin@barberia.com`
   - Password: `admin123` (o la que hayas puesto)

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'electron'"
```bash
npm install
```

### Error: "Variables de entorno de Supabase no configuradas"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que las variables empiezan con `VITE_`
- Reinicia el servidor de desarrollo

### Error: "Port 5173 is already in use"
```bash
# Opción 1: Cerrar el proceso que usa el puerto
# Opción 2: Cambiar el puerto en vite.config.ts
```

### La ventana de Electron no se abre
- Verifica que no haya errores en la terminal
- Espera unos segundos más (puede tardar en compilar)
- Verifica que el puerto 5173 esté disponible

### Error de conexión a Supabase
- Verifica que las credenciales en `.env` sean correctas
- Verifica que tu proyecto de Supabase esté activo
- Verifica tu conexión a internet

---

## 📝 Comandos Útiles

```bash
# Desarrollo (con hot reload)
npm run dev

# Solo compilar React (sin Electron)
npm run dev:react

# Solo compilar Electron
npm run build:electron:dev

# Compilar para producción
npm run build

# Ver errores de linting
npm run lint
```

---

## 🎯 Próximos Pasos

Una vez que la app esté corriendo:

1. ✅ **Explora la interfaz** - Navega por los diferentes módulos
2. ✅ **Prueba el módulo de Clientes** - Crea, edita y elimina clientes
3. ✅ **Verifica los permisos** - Prueba con diferentes roles
4. ✅ **Revisa el Dashboard de Barbero** - Ve cómo se muestran las citas

---

## 💡 Tips

- **Hot Reload:** Los cambios en el código se reflejan automáticamente
- **DevTools:** Úsalo para debuggear (F12 o Ctrl+Shift+I)
- **Cerrar la app:** Cierra la ventana o presiona `Ctrl+Q` (Windows/Linux) o `Cmd+Q` (Mac)

---

¿Listo para probar? 🚀

Ejecuta `npm install` y luego `npm run dev` para comenzar!
