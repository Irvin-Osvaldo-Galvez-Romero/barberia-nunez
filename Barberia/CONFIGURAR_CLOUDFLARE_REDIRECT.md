# 🔐 Actualizar Google Cloud Console - Redirect URIs

## ⚠️ PASO CRÍTICO

Para que el flujo OAuth funcione desde tu celular, necesitas agregar la URL pública del backend en Google Cloud Console.

## 📝 Instrucciones

### 1. Ve a Google Cloud Console
https://console.cloud.google.com/apis/credentials

### 2. Selecciona tu proyecto
- Busca el proyecto que tiene el Client ID: `798933263376-o4gg244i5sud1kokj5pu1fhb442dhcce`

### 3. Haz clic en el OAuth 2.0 Client ID

### 4. En "Authorized redirect URIs", AGREGA:
```
https://shoot-encounter-government-matter.trycloudflare.com/api/google/callback-barbero
```

**NO BORRES** las URIs existentes, solo agrega esta nueva.

### 5. Guarda los cambios

---

## ✅ Después de agregar la URI:

**Reinicia el backend:**
```bash
# En la terminal backend/
npm run dev
```

---

## 🔄 Flujo completo (ahora funcionará):

1. **Usuario abre link del email en celular:**
   ```
   https://exceptions-thehun-silence-diy.trycloudflare.com/google-vincular/CODIGO
   ```

2. **Frontend redirige a Google OAuth** para autorizar

3. **Usuario acepta permisos** en Google

4. **Google redirige al backend:**
   ```
   https://shoot-encounter-government-matter.trycloudflare.com/api/google/callback-barbero?code=XXX
   ```

5. **Backend procesa:**
   - Intercambia el code por access_token y refresh_token
   - Guarda tokens en Supabase
   - Marca el código de invitación como "usado"

6. **Backend redirige al frontend:**
   ```
   https://exceptions-thehun-silence-diy.trycloudflare.com/google-vinculado
   ```

7. **Frontend muestra mensaje de éxito** ✅

---

## 📋 URIs que debes tener en Google Cloud:

```
http://localhost:3001/api/google/callback
https://shoot-encounter-government-matter.trycloudflare.com/api/google/callback-barbero
```

(Puedes tener las dos, localhost para desarrollo local y cloudflare para celular)

---

## ⚠️ NOTA IMPORTANTE:

Cada vez que reinicies Cloudflare Tunnel, obtendrás una URL diferente. Necesitarás actualizar la Redirect URI en Google Cloud Console nuevamente.

**Solución permanente:** Crear un dominio personalizado o usar ngrok Pro ($8/mes) para URLs fijas.
