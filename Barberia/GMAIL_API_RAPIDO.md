# ⚡ ATAJO: Gmail API con Proyecto Existente

Ya tienes Google Calendar API configurado? Perfecto! Solo necesitas **3 pasos rápidos**:

## ✅ Paso 1: Habilitar Gmail API (1 min)

1. [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto existente (el de Calendar)
3. "APIs & Services" → "Library"
4. Busca "Gmail API" → Click "Enable"

## ✅ Paso 2: Agregar Redirect URI (1 min)

1. "APIs & Services" → "Credentials"
2. Edita tu OAuth Client existente
3. En "Authorized redirect URIs" agrega:
   ```
   http://localhost:3000/oauth2callback
   ```
4. Save

## ✅ Paso 3: Obtener Refresh Token (5 min)

```bash
# Instala dependencias
cd backend
npm install googleapis google-auth-library

# Edita get-refresh-token.js con TUS credenciales
# (las mismas que usas para Calendar)

# Ejecuta
node backend/get-refresh-token.js
```

Sigue las instrucciones en pantalla y copia el refresh token.

## ✅ Paso 4: Actualizar .env (1 min)

```bash
# Ya tienes esto:
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Solo agrega esto:
GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com  # ← Mismo valor
GMAIL_CLIENT_SECRET=GOCSPX-xxx                   # ← Mismo valor
GMAIL_REFRESH_TOKEN=1//0gxxx                     # ← NUEVO del paso 3
SENDER_EMAIL=tu-email@gmail.com                  # ← Tu Gmail
```

## ✅ Paso 5: Inicializar en server.ts (1 min)

```typescript
import { inicializarGmailOAuth } from './services/gmailService';

// Después de cargar .env
inicializarGmailOAuth();
```

## ✅ Paso 6: Probar (1 min)

```bash
npm run dev

# En otra terminal:
curl http://localhost:3001/test-gmail
```

Revisa tu bandeja de entrada ✅

---

**Total**: ~10 minutos

**Documentación completa**: Ver [CONFIGURAR_GMAIL_API.md](./CONFIGURAR_GMAIL_API.md)
