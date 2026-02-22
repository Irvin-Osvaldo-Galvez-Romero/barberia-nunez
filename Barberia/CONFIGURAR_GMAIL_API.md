# 📧 Configuración Gmail API para Envío de Correos

## 🎯 Objetivo

Configurar Gmail API (OAuth 2.0) para enviar correos desde tu cuenta de Gmail sin usar servicios externos como Brevo.

**Ventajas**:
- ✅ Gratis (usa tu Gmail)
- ✅ Sin límites de servicios externos
- ✅ Control total
- ✅ API oficial de Google

**Desventajas**:
- ⚠️ Configuración inicial más compleja
- ⚠️ Requiere proyecto en Google Cloud
- ⚠️ Necesitas obtener refresh token manualmente

---

## 📋 Paso 1: Usar tu Proyecto Existente (Google Calendar)

**⚡ BUENAS NOTICIAS**: Puedes usar el **mismo proyecto** que ya tienes para Google Calendar API.

### 1.1 Seleccionar el proyecto existente

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Click en el dropdown del proyecto (arriba a la izquierda)
3. **Selecciona tu proyecto existente** (el que usas para Calendar API)
4. Ya no necesitas crear uno nuevo ✅

### 1.2 Habilitar Gmail API (adicional)

1. En el menú lateral → "APIs & Services" → "Library"
2. Busca "Gmail API"
3. Click en "Gmail API"
4. Click "Enable"

**Nota**: Google Calendar API ya está habilitado en tu proyecto. Ahora tendrás ambos.

---

## 📋 Paso 2: Usar tus Credenciales OAuth Existentes

**⚡ OPCIÓN RECOMENDADA**: Si ya tienes credenciales OAuth para Google Calendar, puedes **reutilizarlas**.

### Opción A: Reutilizar credenciales existentes (Más rápido)

1. "APIs & Services" → "Credentials"
2. Busca tu **OAuth 2.0 Client ID** existente
3. **Edítalo** (click en el lápiz)
4. En "Authorized redirect URIs", agrega (si no está):
   ```
   http://localhost:3000/oauth2callback
   ```
5. Click "Save"
6. **Usa el mismo Client ID y Client Secret** que ya tienes ✅

**Ventaja**: Solo necesitas obtener un nuevo refresh token con el scope de Gmail.

### Opción B: Crear nuevas credenciales (Si prefieres separar)

Solo sigue esto si quieres credenciales separadas para emails:

<details>
<summary>Click para expandir</summary>

### 2.1 Configurar pantalla de consentimiento (si no lo hiciste)

1. "APIs & Services" → "OAuth consent screen"
2. User Type: **External** (o Internal si tienes Google Workspace)
3. Click "Create"

**Información de la app**:
- App name: `Sistema Barbería`
- User support email: tu email
- Developer contact: tu email
- Click "Save and Continue"

**Scopes**:
- Click "Add or Remove Scopes"
- Busca y selecciona: `https://www.googleapis.com/auth/gmail.send`
- Click "Update"
- Click "Save and Continue"

**Test users** (si es External):
- Click "Add Users"
- Agrega tu email de Gmail
- Click "Save and Continue"

### 2.2 Crear credenciales

1. "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: `Barberia Backend`

**Authorized redirect URIs**:
```
http://localhost:3000/oauth2callback
```

5. Click "Create"
6. **GUARDA**:
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxx`

</details>

---

## 📋 Paso 3: Obtener Refresh Token

Este paso es **crítico** y se hace **una sola vez**.

### 3.1 Instalar dependencias

```bash
cd backend
npm install googleapis google-auth-library
```

### 3.2 Crear script temporal

Crea el archivo `backend/get-refresh-token.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

// REEMPLAZA CON TUS VALORES
const CLIENT_ID = 'TU_CLIENT_ID.apps.googleusercontent.com';
const CLIENT_SECRET = 'TU_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Scopes necesarios
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Generar URL de autorización
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // Fuerza a obtener refresh token
});

console.log('\n📧 PASO 1: Autoriza la app');
console.log('=========================================');
console.log('Abre esta URL en tu navegador:\n');
console.log(authUrl);
console.log('\n=========================================');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n📋 PASO 2: Pega el código que obtuviste: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ TOKENS OBTENIDOS:');
    console.log('=========================================');
    console.log('Agrega esto a tu .env:\n');
    console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n=========================================');
    
  } catch (error) {
    console.error('❌ Error obteniendo tokens:', error);
  }
  
  rl.close();
});
```

### 3.3 Ejecutar el script

```bash
node backend/get-refresh-token.js
```

**Sigue las instrucciones**:
1. Se abrirá una URL en consola
2. Cópiala y pégala en tu navegador
3. Inicia sesión con tu Gmail
4. Click "Permitir"
5. Te redirige a `localhost:3000/oauth2callback?code=XXXXX`
6. **Copia el código** de la URL (después de `code=`)
7. Pégalo en la terminal

**Resultado**: Obtendrás las 3 variables necesarias.

---

## 📋 Paso 4: Configurar Variables de Entorno

### Opción A: Reutilizar credenciales de Google Calendar (Recomendado)

Si usas las mismas credenciales, tu `.env` quedaría así:

```bash
# Google OAuth (usado por Calendar Y Gmail)
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx

# Gmail API - Solo necesitas agregar esto:
GMAIL_CLIENT_ID=123456789.apps.googleusercontent.com  # ← Mismo que GOOGLE_CLIENT_ID
GMAIL_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx              # ← Mismo que GOOGLE_CLIENT_SECRET
GMAIL_REFRESH_TOKEN=1//0gxxxxxxxxxxxxxxxxxxxx         # ← NUEVO (obtener con script)

# Email del remitente (tu Gmail)
SENDER_EMAIL=tu-email@gmail.com

# URLs (ya las tienes)
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

**Nota**: Aunque `GMAIL_CLIENT_ID` y `GOOGLE_CLIENT_ID` son iguales, los separamos por claridad en el código.

### Opción B: Credenciales separadas

Si creaste credenciales nuevas:

```bash
# Google Calendar OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Gmail API OAuth (diferentes)
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...

# Email del remitente
SENDER_EMAIL=tu-email@gmail.com

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

---

## 📋 Paso 5: Actualizar el Código

### 5.1 Inicializar Gmail en server.ts

En `backend/src/server.ts`, agrega al inicio:

```typescript
import { inicializarGmailOAuth } from './services/gmailService';

// ... después de cargar .env ...

// Inicializar Gmail API
inicializarGmailOAuth();

// ... resto del código ...
```

### 5.2 Verificar que googleEmailService.ts use Gmail

El archivo ya está configurado para usar `gmailService.ts` por defecto:

```typescript
// backend/src/services/googleEmailService.ts
export { enviarCorreoVinculoGoogle } from './gmailService';
```

Si quieres volver a Brevo, descomenta el código y comenta la línea de arriba.

---

## 📋 Paso 6: Probar el Envío

### 6.1 Endpoint de prueba

Crea un endpoint temporal en `backend/src/server.ts`:

```typescript
app.get('/test-gmail', async (req, res) => {
  try {
    const { enviarCorreo } = await import('./services/gmailService');
    
    await enviarCorreo(
      'tu-email@gmail.com',
      '🧪 Test Gmail API',
      '<h1>Funciona!</h1><p>Gmail API configurado correctamente</p>'
    );
    
    res.json({ success: true, message: 'Email enviado' });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
});
```

### 6.2 Ejecutar prueba

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Prueba
curl http://localhost:3001/test-gmail
```

**Resultado esperado**:
```json
{"success":true,"message":"Email enviado"}
```

**Verifica tu bandeja de entrada**.

---

## 📋 Paso 7: Verificar Configuración

### Endpoint de diagnóstico

```typescript
app.get('/gmail-status', async (req, res) => {
  try {
    const { verificarConfiguracionGmail } = await import('./services/gmailService');
    const status = await verificarConfiguracionGmail();
    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      configurado: false, 
      error: error instanceof Error ? error.message : 'Error' 
    });
  }
});
```

**Prueba**:
```bash
curl http://localhost:3001/gmail-status
```

**Respuesta esperada**:
```json
{
  "configurado": true,
  "email": "tu-email@gmail.com"
}
```

---

## 🔍 Troubleshooting

### "Invalid grant" o "Token has been expired or revoked"

**Causa**: El refresh token expiró o fue revocado.

**Solución**:
1. Ve a [Google Account Permissions](https://myaccount.google.com/permissions)
2. Revoca acceso a "Sistema Barbería"
3. Ejecuta de nuevo `get-refresh-token.js`
4. Obtén un nuevo refresh token

### "Gmail API has not been used in project"

**Causa**: Gmail API no está habilitada.

**Solución**:
1. Ve a Google Cloud Console
2. "APIs & Services" → "Library"
3. Busca "Gmail API" → "Enable"

### "Access blocked: This app's request is invalid"

**Causa**: Redirect URI no está configurado.

**Solución**:
1. Google Cloud Console → "Credentials"
2. Edita tu OAuth client
3. Agrega `http://localhost:3000/oauth2callback` en "Authorized redirect URIs"

### "Daily user sending quota exceeded"

**Causa**: Gmail tiene límites diarios (~500 emails/día para cuentas normales).

**Solución**:
- Usa Google Workspace (hasta 2,000/día)
- O usa Brevo/SendGrid para producción

### "Insufficient Permission"

**Causa**: Scope incorrecto o falta en OAuth consent screen.

**Solución**:
1. Google Cloud Console → "OAuth consent screen"
2. Agrega scope: `https://www.googleapis.com/auth/gmail.send`
3. Vuelve a obtener refresh token

---

## 📊 Comparación: Gmail API vs Brevo

| Aspecto | Gmail API | Brevo |
|---------|-----------|-------|
| **Costo** | Gratis | Gratis (300/día) |
| **Setup** | Complejo (30 min) | Simple (5 min) |
| **Límites** | ~500/día (normal) | 300/día (gratis) |
| **Escalabilidad** | Media | Alta |
| **Control** | Total | Limitado |
| **Mantenimiento** | Tokens pueden expirar | Más estable |
| **Producción** | OK para pocos emails | Recomendado |

---

## ✅ Checklist Final

- [ ] Proyecto creado en Google Cloud
- [ ] Gmail API habilitada
- [ ] OAuth consent screen configurado
- [ ] Credenciales OAuth creadas
- [ ] Client ID y Secret guardados
- [ ] Refresh token obtenido (con script)
- [ ] Variables agregadas a `.env`
- [ ] `gmailService.ts` creado
- [ ] `inicializarGmailOAuth()` llamado en server.ts
- [ ] Endpoint de prueba funciona
- [ ] Email llega a tu bandeja

---

## 🔄 Cambiar entre Gmail API y Brevo

### Usar Gmail API (actual)
En `backend/src/services/googleEmailService.ts`:
```typescript
export { enviarCorreoVinculoGoogle } from './gmailService';
```

### Usar Brevo
En `backend/src/services/googleEmailService.ts`:
```typescript
// Comenta la línea de arriba y descomenta el código de Brevo
/*
export async function enviarCorreoVinculoGoogle(...) {
  // código de Brevo
}
*/
```

---

## 📚 Recursos Adicionales

- [Gmail API Docs](https://developers.google.com/gmail/api)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 🎉 ¡Listo!

Tu sistema ahora usa **Gmail API** para enviar correos sin servicios externos.

**Próximos pasos**:
1. Elimina el archivo temporal `get-refresh-token.js`
2. Prueba el flujo completo de vinculación
3. Monitorea los límites de envío de Gmail

**Si tienes problemas**, vuelve a Brevo temporalmente y debuguea con calma.
