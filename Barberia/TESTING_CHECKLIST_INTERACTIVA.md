# ✅ Testing Checklist Interactiva

## 🎯 Objetivo
Verificar que el flujo de vinculación de Google Calendar desde celular funciona completamente.

**Tiempo estimado**: 15-20 minutos

---

## 📋 FASE 1: PREPARACIÓN (2 min)

- [ ] Backend running (`npm run dev`)
  - URL: http://localhost:3001
  - Terminal muestra: "Server running on port 3001"

- [ ] Frontend running (`npm run dev`)
  - URL: http://localhost:5173
  - Página se abre sin errores

- [ ] Supabase conectado
  - Variables en `.env` correctas
  - Puedes ver tablas en dashboard

- [ ] Variables de entorno completas
  - `GOOGLE_CLIENT_ID` ✓
  - `GOOGLE_CLIENT_SECRET` ✓
  - `BREVO_API_KEY` ✓
  - `SENDER_EMAIL` ✓

---

## 📧 FASE 2: GENERAR INVITACIÓN (2 min)

### Test: POST /api/google/generar-invitacion

**Comando**:
```bash
curl -X POST http://localhost:3001/api/google/generar-invitacion \
  -H "Content-Type: application/json" \
  -d '{
    "barberoId": "test_barbero_001",
    "barberoEmail": "tu@email.com",
    "nombreBarbero": "Juan Pérez"
  }'
```

**Verificaciones**:
- [ ] Respuesta con código 200
- [ ] `codigoInvitacion` presente (64 caracteres hex)
- [ ] `linkVinculacion` contiene el código
- [ ] `expira` está 48 horas en el futuro
- [ ] Backend log: "✅ Código de invitación generado"
- [ ] Backend log: "✅ Email enviado exitosamente"

**Guarda**:
```
Código: ________________ (guardar para próximos tests)
Email: tu@email.com
Barbero ID: test_barbero_001
```

---

## 📨 FASE 3: EMAIL RECIBIDO (2 min)

### Test: Verificar email

**Checklist**:
- [ ] Email llega en máximo 2 minutos
- [ ] Asunto: "🔗 Vincula tu Google Calendar - Barbería"
- [ ] De: `noreply@barberia.com` (o SENDER_EMAIL)
- [ ] Contenido HTML se ve bien
- [ ] Link de vinculación es clickeable
- [ ] Fallback de texto plano también visible
- [ ] Código de expiración visible: "48 horas"

**En el email**:
- [ ] Botón: "✓ Vincular Google Calendar"
- [ ] Paso a paso visible: 1. Click → 2. Autoriza → 3. ¡Listo!
- [ ] Logo/Branding presente
- [ ] Pie: "© 2026 Sistema Barbería"

---

## 📱 FASE 4: LANDING PAGE (2 min)

### Test: Acceder a página landing

**URL**: http://localhost:5173/google-vincular/{CODIGO_AQUI}

**Verificaciones**:
- [ ] Página carga rápido (< 2s)
- [ ] Gradiente púrpura visible
- [ ] Spinner animado ("cargando")
- [ ] Texto: "Abriendo Google..."
- [ ] Dark mode se activa si está habilitado

**Comportamiento esperado**:
- [ ] En < 3 segundos, redirige a Google automáticamente
- [ ] NO requiere confirmación del usuario
- [ ] NO hay botones para clickear

**Si NO redirige**:
- [ ] Revisar console (F12) → console
- [ ] Ver logs del backend
- [ ] Verificar que `GOOGLE_CLIENT_ID` es correcto

---

## 🔐 FASE 5: GOOGLE OAUTH (3 min)

### Test: Flujo de autorización

**Paso 1: Google Login**
- [ ] Ves pantalla de login de Google
- [ ] Campo para email/número de teléfono
- [ ] Ingresa tu email de Google
- [ ] Click "Siguiente"

**Paso 2: Contraseña**
- [ ] Ves campo de contraseña
- [ ] Ingresa tu contraseña
- [ ] Click "Siguiente" (o "Entrar")

**Paso 3: Permisos**
- [ ] Ves: "Sistema Barbería solicita acceso"
- [ ] Permisos listados:
  - [ ] "Ver tu calendario"
  - [ ] "Crear eventos"
  - [ ] "Modificar eventos"
- [ ] Click "Permitir" (NO "Cancelar")

**Si todo OK**:
- [ ] Google redirige automáticamente

---

## ✅ FASE 6: PÁGINA DE ÉXITO (2 min)

### Test: Google Vinculado

**URL**: http://localhost:5173/google-vinculado?barberoId=test_barbero_001

**Verificaciones Visuales**:
- [ ] Página carga correctamente
- [ ] Gradiente verde visible
- [ ] Checkmark (✅) animado (efecto pop)
- [ ] Título: "¡Conectado!"
- [ ] Mensaje: "Tu Google Calendar está listo"
- [ ] Info: "Los turnos se sincronizarán automáticamente"

**Comportamiento**:
- [ ] Countdown visible: "En Xs te redirigimos..."
- [ ] Cuenta hacia atrás de 5 a 0
- [ ] Auto-redirige a /login al terminar
- [ ] Botón "Ir a Login" funciona manualmente

**Dark Mode**:
- [ ] Colores verde oscuro si dark mode está ON
- [ ] Texto legible en ambos modos

---

## 💾 FASE 7: VERIFICAR EN SUPABASE (3 min)

### Test: Registros en BD

**Tabla: google_calendar_invitations**

Ejecuta en Supabase SQL Editor:
```sql
SELECT * FROM google_calendar_invitations 
WHERE barbero_id = 'test_barbero_001' 
ORDER BY fecha_creacion DESC LIMIT 1;
```

**Verificaciones**:
- [ ] Existe 1 registro
- [ ] `barbero_id`: test_barbero_001
- [ ] `codigo_invitacion`: (código del email)
- [ ] `fecha_creacion`: hoy
- [ ] `fecha_expiracion`: 48h en el futuro
- [ ] `fecha_confirmacion`: ≠ NULL (tiene timestamp)
- [ ] `usado`: TRUE (booleano)

**Tabla: google_tokens**

```sql
SELECT id, barbero_id, access_token, refresh_token, token_expiry 
FROM google_tokens 
WHERE barbero_id = 'test_barbero_001';
```

**Verificaciones**:
- [ ] Existe 1 registro NUEVO
- [ ] `barbero_id`: test_barbero_001
- [ ] `access_token`: Comienza con "ya29.a0..." (Google token)
- [ ] `refresh_token`: Presente (no NULL)
- [ ] `token_expiry`: ~1 hora en el futuro
- [ ] `created_at`: timestamp reciente

---

## 🔍 FASE 8: ENDPOINT DE VERIFICACIÓN (2 min)

### Test: GET /api/google/verificar-token

**Comando**:
```bash
curl http://localhost:3001/api/google/verificar-token/test_barbero_001
```

**Respuesta esperada**:
```json
{
  "vinculado": true,
  "expirado": false,
  "tieneRefreshToken": true,
  "proximaExpiracion": "2026-01-21T13:34:56.789Z"
}
```

**Verificaciones**:
- [ ] Código 200 OK
- [ ] `vinculado`: **true** (¡CRÍTICO!)
- [ ] `expirado`: **false**
- [ ] `tieneRefreshToken`: **true**
- [ ] `proximaExpiracion`: Fecha futura

---

## 🔌 FASE 9: POLLING EN ELECTRON (3 min)

### Test: Simulación de Polling

**En tu app Electron (o componente React)**:

```typescript
const interval = setInterval(async () => {
  const response = await fetch('/api/google/verificar-token/test_barbero_001');
  const data = await response.json();
  console.log('Estado Google:', data);
  
  if (data.vinculado) {
    console.log('✅ DETECTADO: Google Calendar vinculado!');
    clearInterval(interval);
  }
}, 5000);
```

**Verificaciones**:
- [ ] Primeras llamadas: `vinculado: false`
- [ ] Última llamada (después de completar OAuth): `vinculado: true`
- [ ] Tiempo total: < 10 segundos
- [ ] Console muestra: "✅ DETECTADO"

---

## 🔄 FASE 10: FLUJO COMPLETO NUEVAMENTE (5 min)

### Test: Repetir con nuevo código

**1. Generar nuevo código**:
- [ ] Generar otra invitación (fase 2)
- [ ] Nuevo código: ________________

**2. Acceder desde celular**:
- [ ] Usar tu teléfono real (o Chrome DevTools mobile mode)
- [ ] Ir a: http://localhost:5173/google-vincular/{NUEVO_CODIGO}
- [ ] Verificar que landing page es 100% responsiva

**3. Completar OAuth en celular**:
- [ ] Autorizar en Google
- [ ] Ver página de éxito
- [ ] Botón de cerrar instruye: "Close this window on your phone"

**4. Verificar en Supabase**:
- [ ] Nuevo registro en `google_calendar_invitations`
- [ ] Nuevo token en `google_tokens`

**5. Polling en Electron**:
- [ ] App detecta automáticamente
- [ ] Notificación: "Google Calendar conectado"

---

## 🎨 FASE 11: RESPONSIVE DESIGN (2 min)

### Test: Pantallas diferentes

**En Chrome DevTools (F12)**:

**Mobile (375px)**:
- [ ] Landing page: 100% legible
- [ ] Botones: Mínimo 44px para tap
- [ ] Spinner: Visible y animado
- [ ] Success page: Checkmark visible

**Tablet (768px)**:
- [ ] Gradientes: Correctos
- [ ] Spacing: Proporcional
- [ ] Fonts: Legibles

**Desktop (1920px)**:
- [ ] Gradientes: Completos
- [ ] Animaciones: Suaves
- [ ] Responsive: No rompe

---

## 🌓 FASE 12: DARK MODE (1 min)

### Test: Modo oscuro

**En tu sistema**:
- [ ] Activar "Dark mode" en Windows/Mac
- [ ] Recargar página (Ctrl+R)

**Verificaciones**:
- [ ] Landing page: Fondo oscuro, texto claro
- [ ] Success page: Verde oscuro, bien legible
- [ ] Spinner: Animado y visible
- [ ] Checkmark: Visible en modo oscuro

---

## ⚠️ FASE 13: CASOS DE ERROR (3 min)

### Test 1: Código Expirado

**Setup**:
- [ ] Esperar 48+ horas (o simular en BD)

**Test**:
- [ ] Ir a landing page con código viejo
- [ ] Esperado: Error "Invitación expirada"
- [ ] Mensaje claro en español

### Test 2: Código Inválido

**URL**: http://localhost:5173/google-vincular/codigoinvalido123

**Verificaciones**:
- [ ] No se redirige a Google
- [ ] Muestra error: "Invitación no encontrada"
- [ ] Backend log: Error apropiado

### Test 3: Sin Internet

**Test**:
- [ ] Desconecta internet
- [ ] Recarga página de landing
- [ ] Esperado: Error claro
- [ ] Reconecta y reintentar funciona

### Test 4: Token Expirado en Electron

**Test**:
- [ ] Simular que token expiró en BD
- [ ] Electron intenta acceder a Google Calendar
- [ ] Esperado: Refresh token renovación automática
- [ ] NO hay intervención del usuario

---

## 📊 FASE 14: LOGS (2 min)

### Test: Revisar todos los logs

**Backend (npm run dev)**:
```
✅ [GOOGLE] Invitación creada: a1b2c3d4e5f6g7h8
✅ [GOOGLE] Email enviado a: tu@email.com
✅ [GOOGLE] Processing OAuth callback
✅ [GOOGLE] Code exchanged for tokens
✅ [GOOGLE] Tokens saved for barbero: test_barbero_001
```

**Frontend Console (F12)**:
```
✅ GoogleVincular: Code extracted: a1b2c3d4e5f6g7h8
✅ Redirecting to Google OAuth...
✅ GoogleVinculado: Success! Barbero: test_barbero_001
✅ Redirecting to /login in 5 seconds
```

**Supabase Query Logger**:
- [ ] INSERT en google_calendar_invitations ✓
- [ ] INSERT en google_tokens ✓
- [ ] UPDATE en google_calendar_invitations (usado=true) ✓

---

## 🎯 FASE 15: PERFORMANCE (2 min)

### Test: Velocidades

**Landing page a Google OAuth**:
- [ ] Tiempo: < 3 segundos
- [ ] Sin lag en animación

**OAuth a Success page**:
- [ ] Tiempo: < 5 segundos (incluye autorización)

**Email enviado**:
- [ ] Tiempo: < 2 minutos

**Verificación en Supabase**:
- [ ] Datos visibles: < 1 segundo

**Polling en Electron**:
- [ ] Detecta vinculación: < 10 segundos

---

## ✨ RESULTADO FINAL

Si pasas TODAS las fases:

```
╔══════════════════════════════════════════════╗
║                                              ║
║  ✅ SISTEMA DE VINCULACIÓN FUNCIONANDO 100% ║
║                                              ║
║  Barbero recibe email ✓                      ║
║  Click desde celular ✓                       ║
║  Autorización Google ✓                       ║
║  Token guardado en BD ✓                      ║
║  Electron lo detecta ✓                       ║
║  Sincronización automática ✓                 ║
║                                              ║
║         ¡LISTO PARA PRODUCCIÓN!              ║
║                                              ║
╚══════════════════════════════════════════════╝
```

---

## 📝 Notas Finales

- [ ] Documentar cualquier error encontrado
- [ ] Crear issues en GitHub si es necesario
- [ ] Comunicar a barberos cómo usar el flujo
- [ ] Crear video de demostración para capacitación
- [ ] Monitorear logs en producción

---

## 🚀 Próximos Pasos

1. [ ] Deploy a staging
2. [ ] Testing con barberos reales
3. [ ] Recolectar feedback
4. [ ] Deploy a producción
5. [ ] Monitoreo y métricas

---

**¡Felicidades! Tu sistema de vinculación Google Calendar desde celular está probado y listo!** 🎉
