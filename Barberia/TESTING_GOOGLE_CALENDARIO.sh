#!/bin/bash

# ================================================================
# PRUEBAS CON CURL: Vinculación Google Calendar desde Celular
# ================================================================

# Variables para reemplazar
BACKEND_URL="http://localhost:3001"
BARBERO_ID="barbero123"
BARBERO_EMAIL="tu@email.com"
BARBERO_NOMBRE="Juan Pérez"

echo "🧪 Testing Endpoints de Google Calendar..."
echo "========================================="

# ================================================================
# 1️⃣ GENERAR INVITACIÓN
# ================================================================
echo ""
echo "1️⃣ Generando invitación..."
echo "POST /api/google/generar-invitacion"
echo ""

curl -X POST $BACKEND_URL/api/google/generar-invitacion \
  -H "Content-Type: application/json" \
  -d "{
    \"barberoId\": \"$BARBERO_ID\",
    \"barberoEmail\": \"$BARBERO_EMAIL\",
    \"nombreBarbero\": \"$BARBERO_NOMBRE\"
  }" | jq .

echo ""
echo "⏱️ Guarda el 'codigoInvitacion' de arriba para los próximos tests"
read -p "Ingresa el codigoInvitacion: " CODIGO_INVITACION

# ================================================================
# 2️⃣ VERIFICAR INVITACIÓN EN BD
# ================================================================
echo ""
echo "2️⃣ Verificando invitación en Supabase..."
echo "SELECT * FROM google_calendar_invitations WHERE codigo_invitacion = '$CODIGO_INVITACION';"
echo ""
echo "⚠️ Ejecuta esto en tu dashboard de Supabase"

# ================================================================
# 3️⃣ GENERAR URL DE GOOGLE OAUTH
# ================================================================
echo ""
echo "3️⃣ Generando URL de Google OAuth..."
echo "(En la app: GoogleVincular.tsx hace esto automáticamente)"
echo ""

curl -X GET "$BACKEND_URL/api/google/generar-url-oauth?codigo=$CODIGO_INVITACION" | jq .

# ================================================================
# 4️⃣ SIMULAR CALLBACK DE GOOGLE
# ================================================================
echo ""
echo "4️⃣ Simulando callback de Google..."
echo "⚠️ Este endpoint lo llamará Google automáticamente"
echo "GET /api/google/callback-barbero?code=GOOGLE_CODE&state=$CODIGO_INVITACION"
echo ""
echo "En pruebas manuales:"
echo "- Go to: https://localhost:5173/google-vincular/$CODIGO_INVITACION"
echo "- Authorize with Google"
echo "- Google redirects to: http://localhost:3001/api/google/callback-barbero?code=...&state=$CODIGO_INVITACION"
echo "- Backend exchanges code for tokens"

# ================================================================
# 5️⃣ VERIFICAR TOKEN GUARDADO
# ================================================================
echo ""
echo "5️⃣ Verificando token guardado..."
echo "GET /api/google/verificar-token/$BARBERO_ID"
echo ""

curl -X GET $BACKEND_URL/api/google/verificar-token/$BARBERO_ID | jq .

# ================================================================
# 6️⃣ VERIFICAR EN SUPABASE
# ================================================================
echo ""
echo "6️⃣ Verificando en Supabase..."
echo "SELECT * FROM google_tokens WHERE barbero_id = '$BARBERO_ID';"
echo ""
echo "⚠️ Ejecuta esto en tu dashboard de Supabase"

# ================================================================
# FLUJO COMPLETO SIMULADO
# ================================================================
echo ""
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 FLUJO COMPLETO SIMULADO"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ 1. Barbero recibe email con link"
echo "   → Link contiene: $CODIGO_INVITACION"
echo ""
echo "✅ 2. Barbero click en email desde celular"
echo "   → Frontend redirige a Google"
echo ""
echo "✅ 3. Barbero autoriza Google Calendar"
echo "   → Google redirige a callback con code y state"
echo ""
echo "✅ 4. Backend procesa callback"
echo "   → Intercambia code por tokens"
echo "   → Guarda tokens en google_tokens"
echo ""
echo "✅ 5. Frontend muestra '¡Conectado!'"
echo "   → Auto-redirige a login después de 5s"
echo ""
echo "✅ 6. App Electron detecta token"
echo "   → Polling a /api/google/verificar-token/:barberoId"
echo "   → Respuesta: {vinculado: true}"
echo ""

# ================================================================
# ENDPOINTS DISPONIBLES
# ================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📡 ENDPOINTS DISPONIBLES"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "POST /api/google/generar-invitacion"
echo "  Body: { barberoId, barberoEmail, nombreBarbero }"
echo "  Response: { codigoInvitacion, linkVinculacion, expira }"
echo ""
echo "GET /api/google/generar-url-oauth?codigo=CODE"
echo "  Response: { urlGoogle: 'https://...' }"
echo ""
echo "GET /api/google/callback-barbero?code=CODE&state=CODIGO_INVITACION"
echo "  (Automático desde Google)"
echo "  Redirige a: /google-vinculado?barberoId=..."
echo ""
echo "GET /api/google/verificar-token/:barberoId"
echo "  Response: { vinculado: true/false, expirado: true/false, tieneRefreshToken: true/false }"
echo ""
echo "POST /api/google/enviar-link-manual"
echo "  Body: { barberoId }"
echo "  Response: { success: true, message: '...' }"
echo ""

# ================================================================
# ESTRUCTURA DE RESPUESTAS
# ================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 ESTRUCTURA DE RESPUESTAS"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1️⃣ generar-invitacion:"
echo '{
  "codigoInvitacion": "a1b2c3d4e5f6g7h8...",
  "linkVinculacion": "http://localhost:5173/google-vincular/a1b2c3d4...",
  "expira": "2026-01-20T12:34:56.789Z"
}'
echo ""
echo "2️⃣ generar-url-oauth:"
echo '{
  "urlGoogle": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&scope=...&state=..."
}'
echo ""
echo "3️⃣ verificar-token:"
echo '{
  "vinculado": true,
  "expirado": false,
  "tieneRefreshToken": true,
  "proximaExpiracion": "2026-01-21T12:34:56.789Z"
}'
echo ""

# ================================================================
# LOGS A REVISAR
# ================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔍 LOGS A REVISAR"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Backend logs (npm run dev):"
echo "  ✅ 'Invitación creada con código...'"
echo "  ✅ 'Procesando callback de Google'"
echo "  ✅ 'Tokens guardados para barbero...'"
echo ""
echo "Frontend console (F12):"
echo "  ✅ 'Redirigiendo a Google...'"
echo "  ✅ 'Invitación confirmada'"
echo "  ✅ 'Redirigiendo a login...'"
echo ""
echo "Supabase:"
echo "  ✅ Tabla google_calendar_invitations con registro nuevo"
echo "  ✅ Tabla google_tokens con access_token y refresh_token"
echo ""

echo ""
echo "✅ Testing completado!"
