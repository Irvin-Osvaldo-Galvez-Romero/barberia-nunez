# ⚡ Instrucciones Rápidas para Previsualizar la App

## 🚀 Pasos Rápidos (3 minutos)

### 1️⃣ Instalar Dependencias
```bash
npm install
```

### 2️⃣ Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

**Opción A: Solo para ver la interfaz (sin funcionalidad)**
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Opción B: Con Supabase (funcionalidad completa)**
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon
```

### 3️⃣ Ejecutar la App
```bash
npm run dev
```

¡Listo! La ventana de Electron se abrirá automáticamente.

---

## 📋 Si Quieres Funcionalidad Completa

1. **Crea proyecto en Supabase:** [https://supabase.com](https://supabase.com)
2. **Ejecuta el script SQL** de `docs/SETUP.md` en Supabase SQL Editor
3. **Crea un usuario** en Authentication > Users
4. **Crea el empleado y usuario** en la base de datos (ver `docs/SETUP.md`)

---

## 🐛 Problemas Comunes

**Error: "Cannot find module"**
→ Ejecuta `npm install`

**Error: "Port 5173 in use"**
→ Cierra otros procesos o cambia el puerto en `vite.config.ts`

**La ventana no se abre**
→ Espera 10-20 segundos, puede tardar en compilar

---

Para más detalles, ve a `GUIA_PREVIEW.md`
