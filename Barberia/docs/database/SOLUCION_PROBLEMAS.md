# Solución de Problemas - Conexión a Supabase

## ⚠️ Problema: "Modo DEMO activo" cuando debería estar conectado

Si ves el mensaje `⚠️ Modo DEMO activo - Usando localStorage` pero ya configuraste el archivo `.env`, sigue estos pasos:

### Paso 1: Verificar que el archivo `.env` existe

1. Ve a la carpeta `frontend` de tu proyecto
2. Asegúrate de que existe un archivo llamado `.env` (sin extensión)
3. El archivo debe estar en: `frontend/.env` (NO en la raíz del proyecto)

### Paso 2: Verificar el contenido del archivo `.env`

El archivo debe tener exactamente este formato (sin espacios adicionales):

```bash
VITE_SUPABASE_URL=https://volelarivkbmikhdqolo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGVsYXJpdmtibWlraGRxb2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTYzODAsImV4cCI6MjA4MzY3MjM4MH0.cc8c6i_CvwfAHhUJGMbhxkklTmUf8kDWX30ntfF65oA
```

**⚠️ Errores comunes:**
- Espacios antes o después del `=`
- Saltos de línea incorrectos
- Comillas alrededor de los valores (NO usar comillas)
- Valores vacíos después del `=`

### Paso 3: Verificar la ubicación del archivo

El archivo `.env` debe estar en:
```
Barberia/
  └── frontend/
      ├── .env          ← AQUÍ
      ├── package.json
      ├── src/
      └── ...
```

**NO debe estar en:**
```
Barberia/
  ├── .env          ← ❌ INCORRECTO
  └── frontend/
```

### Paso 4: Reiniciar el servidor de desarrollo

**⚠️ IMPORTANTE:** Vite solo carga las variables de entorno cuando se inicia el servidor.

1. **Detén el servidor** completamente:
   - Ve a la terminal donde está corriendo `npm run dev`
   - Presiona `Ctrl+C`
   - Espera a que se detenga completamente

2. **Cierra la aplicación Electron** si está abierta:
   - Cierra todas las ventanas de la aplicación
   - Asegúrate de que no esté corriendo en segundo plano

3. **Reinicia el servidor**:
   ```bash
   npm run dev
   ```

4. **Vuelve a abrir la aplicación Electron**

### Paso 5: Verificar en la consola

1. Abre DevTools (`Ctrl+Shift+I`)
2. Ve a la pestaña Console
3. Busca el mensaje:
   - ✅ `✅ Conectado a Supabase: https://volelarivkbmikhdqolo.supabase.co`
   - ⚠️ `⚠️ Modo DEMO activo` (si sigue apareciendo)

## 🔍 Verificación Avanzada

### Verificar variables de entorno en la consola

Abre DevTools (`Ctrl+Shift+I`) y en la pestaña Console ejecuta:

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada')
```

**Resultado esperado:**
- `URL: https://volelarivkbmikhdqolo.supabase.co`
- `Key: Configurada`

**Si ves `undefined`:**
- El archivo `.env` no se está cargando
- Verifica los pasos anteriores

## 🛠️ Soluciones Específicas

### Problema: El archivo `.env` no existe

**Solución:**
1. Ve a la carpeta `frontend`
2. Crea un nuevo archivo llamado `.env` (sin extensión)
3. Copia el contenido exacto del Paso 2
4. Guarda el archivo
5. Reinicia el servidor

### Problema: El archivo existe pero sigue en modo demo

**Soluciones:**
1. Verifica que no haya espacios alrededor del `=`
2. Verifica que no haya comillas alrededor de los valores
3. Verifica que cada variable esté en una línea separada
4. Reinicia el servidor (ver Paso 4)
5. Limpia la caché de Vite:
   ```bash
   # Detén el servidor
   # Elimina node_modules/.vite si existe
   rm -rf node_modules/.vite  # Linux/Mac
   Remove-Item -Recurse -Force node_modules\.vite  # Windows PowerShell
   # Reinicia el servidor
   npm run dev
   ```

### Problema: Error de formato en `.env`

**Formato correcto:**
```bash
VITE_SUPABASE_URL=https://volelarivkbmikhdqolo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGVsYXJpdmtibWlraGRxb2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTYzODAsImV4cCI6MjA4MzY3MjM4MH0.cc8c6i_CvwfAHhUJGMbhxkklTmUf8kDWX30ntfF65oA
```

**Formato incorrecto (NO usar):**
```bash
# ❌ Con espacios
VITE_SUPABASE_URL = https://volelarivkbmikhdqolo.supabase.co

# ❌ Con comillas
VITE_SUPABASE_URL="https://volelarivkbmikhdqolo.supabase.co"

# ❌ Con comillas simples
VITE_SUPABASE_URL='https://volelarivkbmikhdqolo.supabase.co'

# ❌ En múltiples líneas
VITE_SUPABASE_URL=https://
volelarivkbmikhdqolo.supabase.co
```

### Problema: Warning sobre múltiples GoTrueClient

Este warning es normal y no afecta la funcionalidad. Ocurre porque se están creando múltiples instancias del cliente de Supabase. Puedes ignorarlo por ahora.

## 📝 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] El archivo `.env` existe en `frontend/.env`
- [ ] El archivo tiene el formato correcto (sin espacios, sin comillas)
- [ ] Las variables tienen valores (no están vacías)
- [ ] El servidor se reinició después de crear/modificar `.env`
- [ ] La aplicación Electron se cerró y volvió a abrir
- [ ] Las credenciales son correctas (URL y Anon Key)

## 🔗 Referencias

- [Documentación de Vite - Variables de Entorno](https://vitejs.dev/guide/env-and-mode.html)
- Ver también: `VERIFICAR_CONEXION.md` para más métodos de verificación
