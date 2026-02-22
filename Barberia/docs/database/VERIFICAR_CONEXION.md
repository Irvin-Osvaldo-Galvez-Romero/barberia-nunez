# Cómo Verificar que la App Está Usando Supabase

Esta guía te ayudará a verificar que tu aplicación de escritorio está conectada a Supabase en lugar del modo demo.

## 🔍 Métodos de Verificación

### Método 1: Verificar en la Consola de Desarrollador (Recomendado) ⭐

1. **Abrir DevTools en Electron:**
   - Presiona `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Option+I` (Mac)
   - O desde el menú: **View** → **Toggle Developer Tools**

2. **Ir a la pestaña Console**

3. **Buscar el mensaje de conexión:**
   - ✅ Si ves: `✅ Conectado a Supabase: https://volelarivkbmikhdqolo.supabase.co` → Está conectado
   - ⚠️ Si ves: `⚠️ Modo DEMO activo - Usando localStorage` → Está en modo demo

4. **Abrir la pestaña Network (Red):**
   - Filtra por `supabase.co`
   - Deberías ver peticiones a `https://volelarivkbmikhdqolo.supabase.co`
   - Si ves peticiones, está conectado ✅
   - Si no ves peticiones, está en modo demo ❌

### Método 2: Verificar Datos (Tablas Vacías vs Datos Demo)

**En modo DEMO:**
- Las tablas tienen datos predefinidos
- Siempre verás clientes, servicios, empleados, etc. pre-cargados
- Datos como "Juan Pérez", "María García", etc.

**En modo SUPABASE:**
- Las tablas estarán vacías (excepto datos iniciales)
- Solo verás:
  - Horarios (7 días configurados)
  - Información del negocio (1 registro)
  - Configuración general (1 registro)
  - Configuración de notificaciones (1 registro)

**Pasos para verificar:**
1. Abre la aplicación
2. Inicia sesión con `admin@demo.com` / `demo123`
3. Ve a **Clientes**
4. Si ves una tabla vacía (o solo con datos que agregaste), está en Supabase ✅
5. Si ves datos pre-cargados (Juan Pérez, María García, etc.), está en modo demo ❌

### Método 3: Crear un Registro y Verificar en Supabase (Más Confiable)

1. **En la aplicación:**
   - Ve a **Clientes**
   - Click en **Nuevo Cliente**
   - Completa el formulario:
     - Nombre: "Cliente de Prueba"
     - Teléfono: "555-9999"
     - Email: "prueba@test.com"
   - Guarda el cliente

2. **En Supabase Dashboard:**
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto: `volelarivkbmikhdqolo`
   - Ve a **Table Editor** en el menú lateral
   - Abre la tabla `clientes`
   - Si ves "Cliente de Prueba" que acabas de crear, está conectado a Supabase ✅
   - Si no aparece, está en modo demo ❌

### Método 4: Verificar Variables de Entorno (Técnico)

1. **Abre la consola de desarrollador** (`Ctrl+Shift+I`)

2. **En la pestaña Console, ejecuta:**
   ```javascript
   console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
   console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada (' + import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...)' : 'No configurada')
   ```

3. **Resultado esperado:**
   - `URL: https://volelarivkbmikhdqolo.supabase.co`
   - `Key: Configurada (eyJhbGciOiJIUzI1NiIs...`
   - Si ves valores, las variables están cargadas ✅
   - Si ves `undefined`, el archivo `.env` no está cargado ❌

### Método 5: Verificar en Supabase Dashboard (Consultas en Tiempo Real)

1. **En Supabase:**
   - Ve a [https://supabase.com/dashboard/project/volelarivkbmikhdqolo](https://supabase.com/dashboard/project/volelarivkbmikhdqolo)
   - Ve a **Logs** en el menú lateral (o **Database** → **Logs**)

2. **En la aplicación:**
   - Realiza una acción (cargar clientes, crear uno nuevo, etc.)

3. **En Supabase:**
   - Si ves consultas SQL apareciendo en tiempo real, está conectado ✅
   - Si no ves nada, está en modo demo ❌

## ✅ Verificación Rápida (Checklist)

Marca cada verificación:

- [ ] Archivo `.env` existe en `frontend/` con las credenciales correctas
- [ ] Variables de entorno están configuradas (Método 4)
- [ ] En Console se ve "✅ Conectado a Supabase" (Método 1)
- [ ] En Network tab se ven peticiones a Supabase (Método 1)
- [ ] Las tablas están vacías (solo datos iniciales) (Método 2)
- [ ] Los datos creados aparecen en Supabase Dashboard (Método 3)
- [ ] Se ven consultas en tiempo real en Supabase Logs (Método 5)

## ⚠️ Problemas Comunes

### La app sigue en modo demo

**Causas posibles:**
1. El archivo `.env` no está en la carpeta correcta (`frontend/.env`)
2. Las variables tienen espacios o saltos de línea incorrectos
3. El servidor no se reinició después de crear el `.env`
4. Las credenciales están mal escritas

**Solución:**
1. Verifica que el archivo `.env` esté en `frontend/` (no en la raíz del proyecto)
2. Verifica que no haya espacios antes o después del `=`
3. **Detén el servidor** (`Ctrl+C` en la terminal)
4. **Reinicia el servidor**: `npm run dev`
5. **Cierra completamente la aplicación Electron** si está abierta
6. **Vuelve a abrir la aplicación**
7. Verifica las credenciales usando el Método 4

### No se ven peticiones en Network

**Posibles causas:**
1. El script SQL no se ejecutó (las tablas no existen)
2. Hay un error de conexión
3. Las credenciales son incorrectas

**Solución:**
1. Ejecuta el script SQL en Supabase (ver `SETUP_SUPABASE.md`)
2. Revisa la consola de desarrollador para ver errores (pestaña Console)
3. Verifica las credenciales en Supabase Dashboard → Settings → API

### Error en la consola: "Failed to fetch" o "Network error"

**Solución:**
1. Verifica tu conexión a internet
2. Verifica que las credenciales sean correctas
3. Verifica que el proyecto de Supabase esté activo en el dashboard

## 📝 Nota Importante

**⚠️ Después de cambiar el `.env`:**
- Siempre reinicia el servidor de desarrollo
- Cierra completamente la aplicación Electron
- Vuelve a abrir la aplicación

Los cambios en `.env` solo se aplican cuando se inicia el servidor.

## 🎯 Verificación Rápida en 30 Segundos

1. Abre DevTools (`Ctrl+Shift+I`)
2. Ve a Console
3. Busca: `✅ Conectado a Supabase` → Está conectado ✅
4. O busca: `⚠️ Modo DEMO activo` → Está en modo demo ❌
