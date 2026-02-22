# ⚡ Checklist Rápido: Vinculación Google Calendar Celular

## 🎯 Lo que se hizo

Se creó un **flujo completo y automático** para que los barberos vinculen Google Calendar desde el celular:

```
Barbero recibe email → Click desde celular → Autoriza Google 
→ Token guardado automáticamente → App Electron lo detecta
```

**7 archivos nuevos creados** con todo lo necesario.

---

## 📋 Pasos Inmediatos (5-10 minutos)

### 1️⃣ Configurar Variables de Entorno

Abre `.env` en la raíz y agrega:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=TU_ID_DESDE_GOOGLE_CLOUD
GOOGLE_CLIENT_SECRET=TU_SECRET_DESDE_GOOGLE_CLOUD

# Brevo (emails)
BREVO_API_KEY=tu_api_key_brevo
SENDER_EMAIL=noreply@barberia.com

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

**Cómo obtener:**
- [Google OAuth](https://console.cloud.google.com/) → OAuth 2.0 → Copiar ID y Secret
- [Brevo API](https://app.brevo.com/settings/account/api) → SMTP y API → Copiar clave

### 2️⃣ Crear Tablas en Supabase

Abre Supabase → SQL Editor → Copia y ejecuta esto:

```sql
-- Tabla de invitaciones
CREATE TABLE IF NOT EXISTS google_calendar_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbero_id TEXT NOT NULL UNIQUE,
  barbero_email TEXT NOT NULL,
  codigo_invitacion TEXT UNIQUE NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_expiracion TIMESTAMP NOT NULL,
  fecha_confirmacion TIMESTAMP,
  usado BOOLEAN DEFAULT FALSE
);

-- Tabla de tokens OAuth
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbero_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_invitacion_codigo ON google_calendar_invitations(codigo_invitacion);
CREATE INDEX idx_invitacion_barbero ON google_calendar_invitations(barbero_id);
CREATE INDEX idx_tokens_barbero ON google_tokens(barbero_id);
```

### 3️⃣ Actualizar Backend

**Archivo:** `backend/src/server.ts`

Busca donde está el `app.listen()` y **ANTES** agrega:

```typescript
import googleInvitationRouter from './routes/googleInvitation';

// ... otras rutas ...

app.use('/api/google', googleInvitationRouter);
```

### 4️⃣ Actualizar Frontend

**Archivo:** `frontend/src/App.tsx`

En la sección de `<Routes>`, agrega:

```typescript
import GoogleVincular from './pages/GoogleVincular';
import GoogleVinculado from './pages/GoogleVinculado';

// ... dentro de <Routes> ...
<Route path="/google-vincular/:codigoInvitacion" element={<GoogleVincular />} />
<Route path="/google-vinculado" element={<GoogleVinculado />} />
```

### 5️⃣ Verificar Archivos Están en Lugar

```
✅ backend/src/services/googleInvitationService.ts
✅ backend/src/services/googleEmailService.ts
✅ backend/src/routes/googleInvitation.ts
✅ frontend/src/pages/GoogleVincular.tsx
✅ frontend/src/pages/GoogleVincular.module.css
✅ frontend/src/pages/GoogleVinculado.tsx
✅ frontend/src/pages/GoogleVinculado.module.css
```

---

## 🧪 Probar el Flujo (después de los pasos anteriores)

### Terminal 1: Backend
```bash
cd backend
npm install  # Si necesita dependencias nuevas
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Prueba Completa

1. **Enviar invitación** (desde Admin panel):
   ```bash
   curl -X POST http://localhost:3001/api/google/generar-invitacion \
     -H "Content-Type: application/json" \
     -d '{
       "barberoId": "barbero123",
       "barberoEmail": "tu@email.com",
       "nombreBarbero": "Juan"
     }'
   ```

2. **Revisar correo** (checar bandeja de entrada)

3. **Click en el link desde celular** (o `localhost:5173/google-vincular/{codigo}`)

4. **Autorizar en Google**

5. **Ver "¡Conectado!"** en la pantalla

6. **Verificar token en BD**:
   ```sql
   SELECT * FROM google_tokens WHERE barbero_id = 'barbero123';
   ```

---

## 🔍 Después de Pasos Iniciales

Tienes estas opciones:

### ✅ Opción A: Agregar Botón en Admin Panel
Para que los admins puedan enviar la invitación manualmente.

### ✅ Opción B: Implementar Polling en Electron
Para que cuando el barbero inicie sesión, detecte si el token llegó.

### ✅ Opción C: Agregar Notificaciones
Notificar al barbero cuando se haya vinculado correctamente.

---

## 📊 Estructura de Carpetas Final

```
proyecto/
├── backend/
│   └── src/
│       ├── services/
│       │   ├── googleInvitationService.ts ✅
│       │   ├── googleEmailService.ts ✅
│       │   └── ... otros servicios
│       ├── routes/
│       │   ├── googleInvitation.ts ✅
│       │   └── ... otras rutas
│       └── server.ts (actualizado) ✅
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── GoogleVincular.tsx ✅
│       │   ├── GoogleVincular.module.css ✅
│       │   ├── GoogleVinculado.tsx ✅
│       │   ├── GoogleVinculado.module.css ✅
│       │   └── ... otras páginas
│       └── App.tsx (actualizado) ✅
│
├── .env (actualizado) ✅
└── GUIA_VINCULACION_GOOGLE_CELULAR.md (referencia completa)
```

---

## ⏱️ Tiempo Estimado

- **Setup inicial (.env + SQL)**: 5 minutos
- **Integración Backend**: 2 minutos
- **Integración Frontend**: 2 minutos
- **Pruebas completas**: 5-10 minutos

**Total: 14-19 minutos** ⚡

---

## ✨ Resultado Final

Cuando todo esté listo:

- 🎯 Barbero recibe email con link mágico
- 📱 Click desde celular = autoriza en Google automáticamente
- 💾 Token se guarda en BD automáticamente
- 🖥️ App de escritorio lo detecta automáticamente
- ✅ Google Calendar sincroniza automáticamente

**¡Sin que el barbero tenga que hacer nada más!** 🚀

---

## 🆘 Si algo falla

1. **Correo no se envía** → Revisar `BREVO_API_KEY` en `.env`
2. **OAuth error** → Revisar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
3. **Token no se guarda** → Revisar que tabla `google_tokens` exista en Supabase
4. **App no detecta token** → Revisar endpoint `/api/google/verificar-token/:barberoId`

---

**¿Preguntas?** Abre `GUIA_VINCULACION_GOOGLE_CELULAR.md` para la guía completa con troubleshooting detallado.
