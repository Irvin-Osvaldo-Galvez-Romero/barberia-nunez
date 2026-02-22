# 🚀 Configuración de Google Calendar para Barberos

## ✅ Ya completado
1. ✅ Tablas creadas en Supabase (`google_tokens`, `google_events`)
2. ✅ Backend API creado (Express + Google OAuth)
3. ✅ Frontend actualizado para usar el backend

## 📋 Pasos para completar la configuración

### 1️⃣ Configurar Google Cloud Console

1. Ve a [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Habilita la **Google Calendar API**:
   - Navega a "APIs & Services" > "Library"
   - Busca "Google Calendar API"
   - Click en "Enable"

4. Crear credenciales OAuth 2.0:
   - Ve a "APIs & Services" > "Credentials"
   - Click en "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Tipo de aplicación: **Web application**
   - Nombre: `Barberia App`
   - **Authorized JavaScript origins**:
     - `http://localhost:3001`
     - `http://localhost:5173`
   - **Authorized redirect URIs**:
     - `http://localhost:3001/api/google/callback`
   - Click en "CREATE"
   - **Copia el Client ID y Client Secret**

### 2️⃣ Configurar variables de entorno

#### Backend (`backend/.env`):
```env
PORT=3001

# Supabase (copia desde Supabase Dashboard -> Settings -> API)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Google OAuth (desde Google Cloud Console)
GOOGLE_CLIENT_ID=798933263376-jqr6ue8c1e1ekmr6fnrt0aqtht0fqpte.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/api/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`.env` ya está configurado):
```env
VITE_GOOGLE_CLIENT_ID=798933263376-jqr6ue8c1e1ekmr6fnrt0aqtht0fqpte.apps.googleusercontent.com
VITE_BACKEND_URL=http://localhost:3001
```

### 3️⃣ Instalar dependencias del backend

```powershell
cd backend
npm install
```

### 4️⃣ Iniciar servidores

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend (ya lo tienes corriendo):**
```powershell
npm run dev
```

### 5️⃣ Probar la integración

1. **Inicia sesión como barbero** en tu app (http://localhost:5173)
2. Ve al **Dashboard**
3. En "Accesos Rápidos" verás el botón **📅 Google Calendar**
4. **Primera vez:**
   - Click en el botón
   - Te redirige a Google para autorizar
   - Acepta los permisos
   - Te devuelve al Dashboard con mensaje de éxito
5. **Próximas veces:**
   - Click en el botón sincroniza automáticamente las citas

## 🔍 Verificar que funciona

### Verificar tokens en Supabase:
```sql
select * from google_tokens;
```

### Verificar eventos sincronizados:
```sql
select * from google_events;
```

### Logs del backend:
Verás en la consola del backend cada vez que:
- Se genera una URL de autorización
- Se intercambian tokens
- Se sincronizan citas

## 🐛 Solución de problemas

### Error: "Falta SUPABASE_SERVICE_ROLE_KEY"
- Ve a Supabase Dashboard > Settings > API
- Copia la **service_role key** (⚠️ NO la compartas)
- Pégala en `backend/.env`

### Error: "Redirect URI mismatch"
- Ve a Google Cloud Console > Credentials
- Edita tu OAuth client
- Asegúrate que `http://localhost:3001/api/google/callback` esté en la lista

### Error: "CORS"
- Verifica que `FRONTEND_URL` en backend/.env sea `http://localhost:5173`
- Reinicia el backend

### No aparece el botón de Google Calendar
- Solo se muestra para usuarios con rol **BARBERO**
- Verifica en Supabase que tu usuario tenga `rol = 'BARBERO'`

## 📦 Estructura final

```
backend/
├── src/
│   ├── config.ts          # Configuración
│   ├── supabase.ts        # Cliente Supabase
│   ├── server.ts          # Servidor Express
│   └── routes/
│       └── google.ts      # Rutas OAuth y sync
├── .env                   # ⚠️ NO subir a git
├── .env.example
├── package.json
└── tsconfig.json

frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx  # Botón de sync actualizado
    └── lib/
        └── googleCalendar.ts  # (ya no se usa client-side)
```

## 🎯 Próximos pasos opcionales

- [ ] Sincronización automática (webhook cuando se crea cita)
- [ ] Actualizar eventos cuando cambia una cita
- [ ] Eliminar eventos cuando se cancela una cita
- [ ] Sincronización bidireccional (leer cambios desde Google)
- [ ] Despliegue en producción (actualizar URLs en Google Console)

## ✅ Checklist final

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Variables de entorno configuradas (backend y frontend)
- [ ] Google Cloud Console: API habilitada y OAuth configurado
- [ ] Redirect URI autorizada en Google Console
- [ ] Usuario de prueba con rol BARBERO
- [ ] Probar: conectar Google Calendar
- [ ] Probar: sincronizar citas
- [ ] Verificar eventos en Google Calendar
