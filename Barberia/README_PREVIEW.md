# 🚀 Cómo Previsualizar la App de Escritorio

## ⚡ Instrucciones Rápidas (3 pasos)

### 1️⃣ Instalar Dependencias
```bash
npm install
```

### 2️⃣ Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

**Para solo ver la interfaz (sin funcionalidad):**
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Para funcionalidad completa (con Supabase):**
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon
```

### 3️⃣ Ejecutar la App
```bash
npm run dev
```

**¡Listo!** La ventana de Electron se abrirá automáticamente en unos segundos.

---

## 📋 Configuración Completa (Si quieres probar funcionalidad)

1. **Crea un proyecto en Supabase:**
   - Ve a [https://supabase.com](https://supabase.com)
   - Crea una cuenta o inicia sesión
   - Crea un nuevo proyecto

2. **Obtén tus credenciales:**
   - En tu proyecto, ve a **Settings > API**
   - Copia la **URL** y la **anon key**
   - Agrégalas al archivo `.env`

3. **Configura la base de datos:**
   - Ve a `docs/SETUP.md`
   - Copia el script SQL completo
   - En Supabase, ve a **SQL Editor**
   - Pega y ejecuta el script

4. **Crea un usuario de prueba:**
   - En Supabase, ve a **Authentication > Users**
   - Crea un nuevo usuario (ej: `admin@barberia.com` / `admin123`)
   - Ejecuta el SQL para crear el empleado y usuario (ver `docs/SETUP.md`)

5. **Inicia sesión en la app:**
   - Usa las credenciales que creaste

---

## 🐛 Solución de Problemas

### "Cannot find module 'electron'"
```bash
npm install
```

### "Variables de entorno no configuradas"
- Verifica que el archivo `.env` existe en la raíz
- Las variables deben empezar con `VITE_`
- Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

### "Port 5173 is already in use"
- Cierra otros procesos que usen el puerto 5173
- O cambia el puerto en `vite.config.ts`

### La ventana no se abre
- Espera 10-20 segundos (puede tardar en compilar)
- Revisa la terminal por errores
- Verifica que Node.js 18+ esté instalado

---

## 💡 Tips

- **Hot Reload:** Los cambios se reflejan automáticamente
- **DevTools:** Presiona `F12` o `Ctrl+Shift+I` para abrir/cerrar
- **Cerrar:** Cierra la ventana o `Ctrl+Q` (Windows) / `Cmd+Q` (Mac)

---

## 📚 Más Información

- **Guía detallada:** `GUIA_PREVIEW.md`
- **Configuración de BD:** `docs/SETUP.md`
- **Instrucciones rápidas:** `INSTRUCCIONES_RAPIDAS.md`

---

¿Listo? Ejecuta `npm install` y luego `npm run dev` 🚀
