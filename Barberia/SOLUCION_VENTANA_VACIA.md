# Solución: Ventana Vacía en Electron

## 🔍 Diagnóstico

Si la ventana de Electron se abre pero está vacía (solo fondo gris), sigue estos pasos:

### 1. Verificar DevTools

**IMPORTANTE:** Presiona `F12` o `Ctrl+Shift+I` para abrir las herramientas de desarrollador. Allí verás los errores.

### 2. Verificar que el servidor esté corriendo

Abre tu navegador y ve a: `http://localhost:5173`

Si ves la aplicación allí, el problema es de Electron.
Si no ves nada, el problema es del servidor de Vite.

### 3. Revisar la consola de Electron

En la terminal donde ejecutaste `npm run dev`, busca errores en rojo.

### 4. Soluciones Comunes

#### Solución A: Reiniciar todo
```bash
# Detener todos los procesos
Ctrl+C en la terminal

# Matar procesos de Electron
taskkill /F /IM electron.exe

# Reiniciar
npm run dev
```

#### Solución B: Verificar puerto
```bash
# Verificar que el puerto 5173 esté libre
netstat -ano | findstr :5173
```

#### Solución C: Limpiar y reinstalar
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### 5. Verificar archivos

Asegúrate de que existan:
- ✅ `frontend/index.html`
- ✅ `frontend/src/main.tsx`
- ✅ `frontend/src/App.tsx`
- ✅ `.env` (puede estar vacío)

### 6. Abrir directamente en navegador

Si Electron no funciona, puedes probar la app directamente:
```bash
npm run dev:react
```
Luego abre `http://localhost:5173` en tu navegador.

---

## 🐛 Errores Comunes

### "Failed to load resource"
→ El servidor de Vite no está corriendo o el puerto está ocupado

### "Cannot find module"
→ Ejecuta `npm run build:electron:dev` antes de `npm run dev`

### "CORS error"
→ Ya está configurado `webSecurity: false` en desarrollo

### Página en blanco sin errores
→ Verifica que `frontend/index.html` exista y tenga el script correcto

---

## ✅ Verificación Rápida

1. ✅ Servidor responde en `http://localhost:5173`
2. ✅ DevTools abierto (F12)
3. ✅ No hay errores en la consola
4. ✅ Archivos en `frontend/src/` existen

---

Si después de estos pasos aún no funciona, comparte:
- Los errores de la consola (DevTools)
- Los errores de la terminal
- Una captura de pantalla
