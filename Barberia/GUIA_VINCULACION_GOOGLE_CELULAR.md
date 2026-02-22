# 📱 Guía Completa: Vinculación Google Calendar desde Celular

## Resumen de lo que se creó

Hemos implementado un flujo completo para que los barberos vinculen Google Calendar **desde el celular sin necesidad de la app de escritorio**:

```
Barbero recibe email → Click en link desde celular → Autoriza Google
→ Token se guarda automáticamente → App de escritorio lo detecta
```

---

## 📋 Archivos Creados

| Archivo | Líneas | Propósito |
|---------|--------|----------|
| `backend/src/services/googleInvitationService.ts` | 280+ | Lógica de invitaciones y OAuth |
| `backend/src/routes/googleInvitation.ts` | 170+ | Endpoints para el flujo |
| `backend/src/services/googleEmailService.ts` | 150+ | Envío de correos con Brevo |
| `frontend/src/pages/GoogleVincular.tsx` | 70+ | Landing page en celular |
| `frontend/src/pages/GoogleVinculado.tsx` | 65+ | Página de éxito |
| `frontend/src/pages/GoogleVincular.module.css` | 250+ | Estilos landing |
| `frontend/src/pages/GoogleVinculado.module.css` | 280+ | Estilos success |

---

## ⚙️ Paso 1: Configurar Variables de Entorno

Agregar a tu archivo `.env` en la raíz del proyecto:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=TU_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET

# Brevo (para envío de emails)
BREVO_API_KEY=tu_api_key_brevo
SENDER_EMAIL=noreply@barberia.com

# URLs (cambiar en producción)
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

### Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita **Google Calendar API**
4. Crea credenciales → **OAuth 2.0 Client ID** → **Web application**
5. **Redirect URIs**: Agregar `http://localhost:3001/api/google/callback-barbero`
6. Copia **Client ID** y **Client Secret**

### Configurar Brevo (Envío de Emails)

1. Regístrate en [Brevo.com](https://www.brevo.com/) (gratis: 300 emails/día)
2. Sección **SMTP y API** → Copia tu **API Key v3**
3. Verifica tu dominio de correo
4. Pega la API key en `.env`

---

## 🗄️ Paso 2: Crear Tabla en Supabase

Ejecuta este SQL en tu dashboard de Supabase:

```sql
-- Tabla para invitaciones de Google Calendar
CREATE TABLE IF NOT EXISTS google_calendar_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbero_id TEXT NOT NULL UNIQUE,
  barbero_email TEXT NOT NULL,
  codigo_invitacion TEXT UNIQUE NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_expiracion TIMESTAMP NOT NULL,
  fecha_confirmacion TIMESTAMP,
  usado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_invitacion_codigo 
  ON google_calendar_invitations(codigo_invitacion);
CREATE INDEX IF NOT EXISTS idx_invitacion_barbero 
  ON google_calendar_invitations(barbero_id);

-- Asegurar que la tabla google_tokens existe (para guardar tokens OAuth)
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbero_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_barbero 
  ON google_tokens(barbero_id);
```

---

## 🚀 Paso 3: Integrar en el Backend

### 3.1 Agregar rutas en `backend/src/server.ts`

```typescript
// Cerca del inicio, después de otros imports
import googleInvitationRouter from './routes/googleInvitation';

// ... resto del código ...

// Agregar esto ANTES de app.listen()
app.use('/api/google', googleInvitationRouter);

// El resto permanece igual
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
```

### 3.2 Verificar que las funciones existan

Asegúrate de que en `backend/src/services/googleInvitationService.ts`:
- ✅ `generarLinkInvitacion(barberoId, email)`
- ✅ `generarURLGoogleOAuth(codigoInvitacion)`
- ✅ `procesarCallbackGoogle(code, codigoInvitacion)`
- ✅ `verificarTokenBarbero(barberoId)`
- ✅ `limpiarInvitacionesExpiradas()`

---

## 🎨 Paso 4: Integrar en el Frontend

### 4.1 Agregar rutas en `frontend/src/App.tsx`

Busca la sección de rutas y agrega:

```typescript
// Dentro del <Routes>
<Route path="/google-vincular/:codigoInvitacion" element={<GoogleVincular />} />
<Route path="/google-vinculado" element={<GoogleVinculado />} />
```

### 4.2 Importar componentes

En `frontend/src/App.tsx` agrega los imports:

```typescript
import GoogleVincular from './pages/GoogleVincular';
import GoogleVinculado from './pages/GoogleVinculado';
```

### 4.3 Verificar estructura de carpetas

```
frontend/src/pages/
├── GoogleVincular.tsx ✅
├── GoogleVincular.module.css ✅
├── GoogleVinculado.tsx ✅
└── GoogleVinculado.module.css ✅
```

---

## 📧 Paso 5: Crear Botón para Enviar Invitación

### Para el Panel Admin o Módulo de Barberos

En el componente donde muestres la lista de barberos, agrega:

```typescript
import { enviarCorreoVinculoGoogle } from '../services/googleEmailService';

async function handleEnviarVinculoGoogle(barberoId: string, email: string, nombre: string) {
  try {
    // Primero generar el link en el backend
    const response = await fetch('/api/google/generar-invitacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barbero_id: barberoId, email })
    });
    
    const data = await response.json();
    const linkVinculacion = `${process.env.REACT_APP_FRONTEND_URL}/google-vincular/${data.codigoInvitacion}`;
    
    // Luego enviar el email
    await enviarCorreoVinculoGoogle(email, nombre, linkVinculacion, data.codigoInvitacion);
    
    alert('✅ Correo de vinculación enviado');
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al enviar el correo');
  }
}
```

---

## 🔄 Paso 6: Hacer que la App Electron Detecte el Token

En tu componente de Electron (cuando el barbero inicie sesión):

```typescript
// useEffect en tu Dashboard o MainApp
useEffect(() => {
  const barberoId = localStorage.getItem('barberoId');
  
  const verificarToken = async () => {
    try {
      const response = await fetch(`/api/google/verificar-token/${barberoId}`);
      const data = await response.json();
      
      if (data.vinculado && !vinculadoAnteriormente) {
        // Token nuevo detectado!
        setVinculado(true);
        showNotification('✅ Google Calendar vinculado exitosamente');
      }
    } catch (error) {
      console.error('Error verificando token:', error);
    }
  };

  // Verificar cada 5 segundos
  const interval = setInterval(verificarToken, 5000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 🧪 Paso 7: Pruebas Manuales

### Test en Desarrollo

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Supabase (si usas local)
supabase start
```

### Flujo de Prueba

1. **Enviar invitación**:
   - Abre `http://localhost:5173/admin` (o donde esté el panel)
   - Busca el barbero
   - Haz click en "Enviar vínculo Google Calendar"
   - Revisa que aparezca un correo en tu bandeja

2. **Hacer click desde celular**:
   - Abre el correo en tu teléfono
   - Haz click en "Vincular Google Calendar"
   - Deberías ver: "Abriendo Google..." seguido del login

3. **Autorizar en Google**:
   - Se abre Google Calendar
   - Autoriza el acceso
   - Deberías ver: "¡Conectado!" con un checkmark verde

4. **Verificar en Supabase**:
   ```sql
   -- En Supabase Query Editor
   SELECT * FROM google_tokens WHERE barbero_id = 'TU_BARBERO_ID';
   -- Deberías ver access_token y refresh_token
   ```

5. **Verificar en la app de escritorio**:
   - El icono de Google Calendar debería mostrar "Vinculado"
   - Las nuevas citas aparecen automáticamente en Google Calendar

---

## 🔑 Estructura de Datos

### Tabla: google_calendar_invitations

```
id: UUID
barbero_id: TEXT (ID del barbero)
barbero_email: TEXT (Email para enviar invitación)
codigo_invitacion: TEXT (Código único, 64 caracteres hex)
fecha_creacion: TIMESTAMP (Cuándo se creó)
fecha_expiracion: TIMESTAMP (Expira en 48 horas)
fecha_confirmacion: TIMESTAMP (Cuándo confirmó)
usado: BOOLEAN (Se usó ya? Para evitar reutilización)
```

### Tabla: google_tokens

```
id: UUID
barbero_id: TEXT (ID del barbero)
access_token: TEXT (Token para acceder a Google Calendar)
refresh_token: TEXT (Token para renovar acceso)
token_expiry: TIMESTAMP (Cuándo expira el access_token)
created_at: TIMESTAMP (Cuándo se obtuvieron los tokens)
updated_at: TIMESTAMP (Última actualización)
```

---

## 📊 Flujo Completo Visualizado

```
BARBERO                    BACKEND                 GOOGLE              SUPABASE
   |                          |                        |                    |
   |-- EMAIL INVITATION ------>|                        |                    |
   |                          |-- CREATE INVITE -------|                    |
   |<-- LINK IN EMAIL ---------|                        |-- INSERT ---------->|
   |                          |                        |                    |
   |-- CLICK LINK (MOBILE) --->|                        |                    |
   |                          |-- OAUTH URL ---------->|                    |
   |<-- REDIRECT TO GOOGLE ----|                        |                    |
   |                                                   |                    |
   |-- AUTHORIZE IN GOOGLE ---|                        |                    |
   |<-- CODE (CALLBACK) --------|                        |                    |
   |                          |<-- REDIRECT BACK ------|                    |
   |-- EXCHANGE CODE -------->|                        |                    |
   |                          |-- GET TOKENS ---------->|                    |
   |                          |<-- TOKENS -------------|                    |
   |                          |-- SAVE TOKENS ---------|                    |
   |<-- "¡CONECTADO!" --------|                        |-- INSERT ---------->|
   |                          |                        |                    |
   |<-- 5s AUTO-REDIRECT -----|                        |                    |
   |                          |                        |                    |
(APP ELECTRON)               |                        |                    |
   |-- VERIFY TOKEN -------->|                        |                    |
   |                          |-- SELECT TOKENS ------|                    |
   |<-- {vinculado: true} -----|                        |-- FETCH ---------->|
   |                          |                        |                    |
   |-- SYNC CITAS ---------->|                        |                    |
   |<-- AUTO-SYNC ENABLED ----|                        |                    |
```

---

## 🐛 Troubleshooting

### "El correo no se envía"
- ✅ Verificar BREVO_API_KEY en `.env`
- ✅ Verificar que el dominio esté verificado en Brevo
- ✅ Revisar los logs del backend

### "Google OAuth falla"
- ✅ Verificar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET
- ✅ Verificar que `http://localhost:3001/api/google/callback-barbero` esté en Google Cloud
- ✅ Revisar que `FRONTEND_URL` sea la correcta

### "El token no se guarda"
- ✅ Verificar que la tabla `google_tokens` existe en Supabase
- ✅ Revisar que Supabase credentials sean correctas
- ✅ Revisar logs del backend

### "La app Electron no detecta el token"
- ✅ Verificar que el `barbero_id` sea el correcto
- ✅ Verificar que el endpoint `GET /api/google/verificar-token/:barberoId` responda
- ✅ Aumentar el interval de polling si es necesario

---

## 📈 Siguientes Pasos (Opcionales)

- [ ] Agregar notificaciones push en celular cuando se vincula
- [ ] Agregar botón para "desvincularse" de Google Calendar
- [ ] Mejorar UI de "invitación expirada"
- [ ] Agregar historial de invitaciones enviadas
- [ ] Agregar resincronización manual de eventos
- [ ] Agregar logs de sincronización

---

## ✅ Checklist de Implementación

- [ ] `.env` actualizado con todas las variables
- [ ] SQL ejecutado en Supabase (tablas creadas)
- [ ] `backend/src/server.ts` actualizado con rutas
- [ ] `frontend/src/App.tsx` actualizado con rutas
- [ ] Componentes copiados a las carpetas correctas
- [ ] CSS modules copiados
- [ ] Google OAuth configurado en Google Cloud
- [ ] Brevo API key configurada
- [ ] Tests manuales pasados
- [ ] App Electron detecta tokens automáticamente

---

## 🆘 Soporte

Si necesitas ayuda:

1. Revisa los logs del backend: `npm run dev`
2. Abre DevTools en el frontend: `F12`
3. Revisa la consola de Supabase
4. Verifica las variables de entorno

¡Tu flujo de vinculación está listo! 🚀
