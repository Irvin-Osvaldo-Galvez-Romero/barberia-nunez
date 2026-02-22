# 🎥 Demostración: Flujo Completo de Vinculación

## 📱 Flujo desde la Perspectiva del Usuario

### Barbero en su Celular

```
┌──────────────────────────────────┐
│         PASO 1: EMAIL             │
│                                  │
│  Recibe email con asunto:        │
│  "🔗 Vincula tu Google Calendar" │
│                                  │
│  De: noreply@barberia.com        │
│  Hora: 2:34 PM                   │
│                                  │
│  [Ver correo] ← Click aquí       │
└──────────────────────────────────┘
        ↓
        ↓
┌──────────────────────────────────┐
│       PASO 2: CONTENIDO EMAIL    │
│                                  │
│  "Hola Juan,                     │
│                                  │
│  Click aquí para vincular:       │
│  [Vincular Google Calendar] ←    │
│                                  │
│  Link válido por 48 horas"       │
└──────────────────────────────────┘
        ↓
        ↓
┌──────────────────────────────────┐
│    PASO 3: LANDING PAGE MOVIL    │
│                                  │
│     🎨 Gradiente Púrpura         │
│                                  │
│     ⏳ "Abriendo Google..."      │
│                                  │
│     [🔄 Spinner]                 │
│                                  │
│  (Se abre automáticamente)       │
└──────────────────────────────────┘
        ↓ (auto-redirige en 2s)
        ↓
┌──────────────────────────────────┐
│     PASO 4: GOOGLE LOGIN         │
│                                  │
│  accounts.google.com/login       │
│                                  │
│  Email: juan@gmail.com           │
│  Password: [****]                │
│                                  │
│  [Siguiente]                     │
└──────────────────────────────────┘
        ↓
        ↓
┌──────────────────────────────────┐
│  PASO 5: PERMISOS GOOGLE         │
│                                  │
│  "Sistema Barbería quiere:       │
│                                  │
│  ✓ Ver tu calendario            │
│  ✓ Crear eventos                │
│  ✓ Modificar eventos"           │
│                                  │
│  [Permitir]  [Cancelar]         │
└──────────────────────────────────┘
        ↓
        ↓
┌──────────────────────────────────┐
│    PASO 6: PÁGINA DE ÉXITO      │
│                                  │
│    🎨 Gradiente Verde            │
│                                  │
│        ✅ (pop animation)        │
│                                  │
│    ¡Conectado!                   │
│                                  │
│ Tu Google Calendar está listo    │
│ Los turnos se sincronizarán      │
│ automáticamente                  │
│                                  │
│ En 5s te redirigimos... 4s       │
│                                  │
│ [Cerrar esta pestaña]            │
└──────────────────────────────────┘
        ↓ (auto-redirige)
        ↓
┌──────────────────────────────────┐
│         PASO 7: LOGIN APP        │
│                                  │
│  Login de la app de escritorio   │
│  (si estaba usando)              │
│                                  │
│  Listo para trabajar             │
│                                  │
└──────────────────────────────────┘
```

---

## 🖥️ Flujo desde la Perspectiva del Admin

### En el Panel de Administración

```
┌─────────────────────────────────────────┐
│        PANEL ADMINISTRACIÓN              │
│                                         │
│  Módulo: Gestionar Barberos             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Juan Pérez                      │   │
│  │ 📧 juan@email.com               │   │
│  │ 📱 +55 1234-5678                │   │
│  │                                 │   │
│  │ Google Calendar: ❌ No vinculado│   │
│  │                                 │   │
│  │ [🔗 Enviar Link Vinculación] ← Click
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
        ↓ (Click en botón)
        ↓
┌─────────────────────────────────────────┐
│        CONFIRMACIÓN (Toast)             │
│                                         │
│  ✅ Invitación enviada a juan@email.com │
│  Válida por 48 horas                    │
│                                         │
│  [Cerrar]                               │
│                                         │
└─────────────────────────────────────────┘
        ↓ (Por debajo)
        ↓
┌─────────────────────────────────────────┐
│      EN EL BACKEND (Logs)               │
│                                         │
│  ✅ Código de invitación generado       │
│     ID: a1b2c3d4e5f6g7h8...            │
│                                         │
│  ✅ Correo enviado exitosamente         │
│     A: juan@email.com                   │
│     Template: HTML con branding         │
│                                         │
│  ✅ Invitación guardada en BD           │
│     Expira: 2026-01-20 14:34:56        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 Flujo en la Base de Datos

```
MOMENTO 1: Barbero recibe email
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
google_calendar_invitations
┌─────────────────────────────────────────┐
│ id                | 550e8400-e29b-41d4  │
│ barbero_id        | "barbero_juan"      │
│ barbero_email     | juan@email.com      │
│ codigo_invitacion | "a1b2c3d4e5f6..."   │
│ fecha_creacion    | 2026-01-20 12:00    │
│ fecha_expiracion  | 2026-01-22 12:00    │ ← 48 horas
│ fecha_confirmacion| NULL                │
│ usado             | FALSE               │
└─────────────────────────────────────────┘


MOMENTO 2: Barbero completa OAuth
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
google_tokens (NUEVO REGISTRO)
┌─────────────────────────────────────────┐
│ id           | 660e8400-e29b-41d5      │
│ barbero_id   | "barbero_juan"          │
│ access_token | "ya29.a0AfH6SMB..."     │ ← Google Token
│ refresh_token| "1//0gk4...refresh..."  │ ← Para renovar
│ token_expiry | 2026-01-21 13:34:56     │ ← Expira en 1h
│ created_at   | 2026-01-20 12:34:56     │
│ updated_at   | 2026-01-20 12:34:56     │
└─────────────────────────────────────────┘

google_calendar_invitations (ACTUALIZADO)
┌─────────────────────────────────────────┐
│ id                | 550e8400-e29b-41d4  │
│ barbero_id        | "barbero_juan"      │
│ barbero_email     | juan@email.com      │
│ codigo_invitacion | "a1b2c3d4e5f6..."   │
│ fecha_creacion    | 2026-01-20 12:00    │
│ fecha_expiracion  | 2026-01-22 12:00    │
│ fecha_confirmacion| 2026-01-20 12:34:56 │ ← AHORA
│ usado             | TRUE                │ ← MARCADO
└─────────────────────────────────────────┘
```

---

## 🔄 Sincronización de Datos

```
PASO 1: Barbero autoriza en Google
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Google ←→ OAuth ←→ Backend
              ↓
        Guarda: access_token, refresh_token
              ↓
        google_tokens table


PASO 2: App Electron detecta
━━━━━━━━━━━━━━━━━━━━━━━━━━━
App              Backend
 ↓                 ↓
 └──→ GET /verify-token/{barbero_id}
                   ↓
      ¿Token existe?
                   ↓
      Sí → {vinculado: true}
                   ↓
 ←───────────────────
 
 ✅ Google Calendar Activo!


PASO 3: Sincronización de Citas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
App: Cita creada
  ↓
Backend: Cita guardada en BD
  ↓
Google Service: access_token disponible
  ↓
Google Calendar API: Crear evento
  ↓
Google Calendar: ✅ Evento creado

Usuario ve evento en Google Calendar automáticamente
```

---

## ⏱️ Timeline Completo

```
12:00:00 → Admin click "Enviar Link"
         ├─ Backend genera código único
         ├─ Supabase INSERT invitation
         └─ Brevo envía email

12:00:15 → Barbero ve email en celular
         └─ Click en "Vincular Google Calendar"

12:00:20 → Frontend GoogleVincular.tsx
         ├─ Extrae código de URL
         ├─ Auto-redirige a Google OAuth
         └─ Spinner: "Abriendo Google..."

12:01:00 → Barbero en Google Login
         ├─ Email: juan@gmail.com
         ├─ Password: [****]
         └─ Click "Siguiente"

12:01:30 → Barbero autoriza permisos
         └─ Click "Permitir"

12:01:35 → Google redirige a callback
         ├─ Backend recibe code + state
         ├─ Intercambia code por tokens
         └─ Supabase INSERT google_tokens

12:01:36 → Frontend GoogleVinculado.tsx
         ├─ Muestra "¡Conectado!" ✅
         └─ Auto-redirige en 5s

12:01:41 → Usuario en login page
         └─ Google Calendar: ✅ Vinculado

12:01:45 → App Electron (polling)
         ├─ GET /verify-token/barbero_juan
         ├─ Response: {vinculado: true}
         └─ ✅ Notificación: "Google Calendar activo"

12:02:00 → Usuario crea primera cita
         ├─ BD: INSERT cita
         ├─ Google Service: create_event()
         └─ Google Calendar: ✅ Evento creado

TOTAL: 2 MINUTOS (sin intervención del usuario después del click)
```

---

## 📈 Casos de Uso

### Caso 1: Primera Vinculación
```
Sin token → Admin envía link → Barbero autoriza → Token guardado ✅
```

### Caso 2: Reenviar Link Expirado
```
Invitación expirada → Admin click "Reenviar" → Nuevo link enviado
```

### Caso 3: Token Expirado (Auto-Renovación)
```
Token expira en 1h → Refresh token renova automáticamente ✅
(Transparente para el usuario)
```

### Caso 4: Desvincularse
```
Usuario click "Desvincularse"
→ Backend: DELETE google_tokens
→ Google Calendar: No sincroniza más
```

---

## 🎨 Pantallas Visuales

### Pantalla 1: Email Recibido
```
┌──────────────────────────────────────┐
│ 🔗 Vincula tu Google Calendar        │
├──────────────────────────────────────┤
│                                      │
│ Hola Juan,                           │
│                                      │
│ Te enviamos este enlace para         │
│ vincular tu Google Calendar.         │
│                                      │
│ Pasos:                               │
│ 1. Haz click en el botón             │
│ 2. Autoriza Google                   │
│ 3. ¡Listo!                           │
│                                      │
│   [✓ Vincular Google Calendar]      │
│                                      │
│ ⏰ Link válido por 48 horas         │
│                                      │
│ © Sistema Barbería                   │
└──────────────────────────────────────┘
```

### Pantalla 2: Landing (Celular)
```
┌──────────────────────────────────┐
│                                  │
│   🎨 Gradiente Púrpura           │
│                                  │
│        🔄 (Spinner)              │
│                                  │
│   Abriendo Google...             │
│                                  │
│                                  │
│                                  │
│                                  │
└──────────────────────────────────┘
```

### Pantalla 3: Google Login
```
┌──────────────────────────────────┐
│  Google                          │
│                                  │
│  juan@gmail.com                  │
│                                  │
│  Siguiente  Atrás                │
│                                  │
└──────────────────────────────────┘
```

### Pantalla 4: Permisos Google
```
┌──────────────────────────────────┐
│  Permisos Requeridos             │
│                                  │
│  Sistema Barbería solicita:      │
│  ✓ Ver calendario               │
│  ✓ Crear eventos               │
│  ✓ Modificar eventos            │
│                                  │
│  [Permitir]  [Cancelar]         │
│                                  │
└──────────────────────────────────┘
```

### Pantalla 5: Éxito
```
┌──────────────────────────────────┐
│                                  │
│   🎨 Gradiente Verde             │
│                                  │
│        ✅ (Pop)                  │
│                                  │
│    ¡Conectado!                   │
│                                  │
│  Tu Google Calendar está listo   │
│  Los turnos se sincronizarán     │
│  automáticamente                 │
│                                  │
│  En 5s te redirigimos... 4s      │
│                                  │
│  [Cerrar esta pestaña]           │
│                                  │
└──────────────────────────────────┘
```

---

## ✅ Puntos de Verificación

### Después de enviar email
```
□ Email llega a barbero en máximo 2 minutos
□ Link es correcto y contiene el código
□ Template se ve bien en Gmail, Outlook, Yahoo
```

### Después de click en email
```
□ Página de landing carga en < 2 segundos
□ Auto-redirige a Google en < 3 segundos
□ No hay mensajes de error
```

### Después de autorizar en Google
```
□ Redirige al callback correctamente
□ Backend procesa sin errores (revisar logs)
□ Tokens se guardan en Supabase
□ Invitación se marca como "usado"
```

### Después de success page
```
□ Muestra "¡Conectado!" en verde
□ Checkmark animado aparece
□ Auto-redirige a login en 5 segundos
□ Se puede cerrar manualmente
```

### En la app Electron
```
□ Polling detecta el token en < 10 segundos
□ Notificación "Google Calendar vinculado" aparece
□ Ícono de Google Calendar cambia de estado
□ Nuevas citas se sincronizan automáticamente
```

---

## 🔍 Debugging

### Logs a revisar en Backend
```
✅ "[GOOGLE] Código de invitación generado: a1b2c3d4..."
✅ "[GOOGLE] Email enviado a juan@email.com"
✅ "[GOOGLE] Invitación guardada en BD"
✅ "[GOOGLE] Processing OAuth callback"
✅ "[GOOGLE] Code exchanged for tokens"
✅ "[GOOGLE] Tokens guardados para barbero_juan"
```

### Logs a revisar en Frontend
```
✅ "GoogleVincular: Código validado"
✅ "Generando URL de OAuth"
✅ "Redirigiendo a Google..."
✅ "GoogleVinculado: ¡Conectado!"
✅ "Auto-redirigiendo a login en 5s"
```

### Registros en Supabase
```
✅ google_calendar_invitations tiene 1 row
   - usado: FALSE → TRUE (después de confirmar)
   - fecha_confirmacion: NULL → timestamp

✅ google_tokens tiene 1 row
   - barbero_id: "barbero_juan"
   - access_token: "ya29.a0A..."
   - refresh_token: "1//0gk4..."
```

---

## 🎬 Resumen de la Experiencia

**Barbero**: Click email → Google → Click "Permitir" → "¡Listo!" ✅

**Admin**: Click botón → "Correo enviado" → ¡Hecho! ✅

**App Electron**: Detecta automáticamente → Sincroniza automáticamente ✅

**Total**: 2 minutos, 0 fricciones, 100% automático 🚀
