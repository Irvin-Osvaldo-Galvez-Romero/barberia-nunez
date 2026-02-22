/**
 * SCRIPT PARA OBTENER REFRESH TOKEN DE GMAIL API
 * Ejecutar UNA SOLA VEZ para obtener el refresh token
 * 
 * USO:
 * 1. Reemplaza CLIENT_ID y CLIENT_SECRET con tus valores
 * 2. npm install googleapis google-auth-library
 * 3. node backend/get-refresh-token.js
 * 4. Sigue las instrucciones
 */

const { google } = require('googleapis');
const readline = require('readline');

// ============================================
// CONFIGURACIÓN - REEMPLAZA CON TUS VALORES
// ============================================
const CLIENT_ID = '798933263376-o4gg244i5sud1kokj5pu1fhb442dhcce.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
// IMPORTANTE: Este debe coincidir con los "Authorized redirect URIs" en Google Cloud Console
const REDIRECT_URI = 'http://localhost:3001/api/google/callback-barbero';

// ============================================
// NO EDITAR DEBAJO DE ESTA LÍNEA
// ============================================

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Scopes necesarios para enviar correos
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Generar URL de autorización
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Necesario para obtener refresh token
  scope: SCOPES,
  prompt: 'consent', // Fuerza a mostrar pantalla de consentimiento
});

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                                                              ║');
console.log('║         OBTENER REFRESH TOKEN PARA GMAIL API                 ║');
console.log('║                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log('📧 PASO 1: Autoriza la app en tu navegador');
console.log('═══════════════════════════════════════════════════════════════');
console.log('\nAbre esta URL en tu navegador:\n');
console.log('\x1b[36m%s\x1b[0m', authUrl); // Cyan color
console.log('\n═══════════════════════════════════════════════════════════════\n');

console.log('Sigue estos pasos:');
console.log('  1. Inicia sesión con tu cuenta de Gmail');
console.log('  2. Click "Permitir" en la pantalla de autorización');
console.log('  3. Serás redirigido a: http://localhost:3000/oauth2callback?code=XXXXX');
console.log('  4. COPIA el código que aparece después de "code="');
console.log('     (Ejemplo: 4/0AeaYSHB...)');
console.log('\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('📋 PASO 2: Pega el código aquí: ', async (code) => {
  try {
    console.log('\n⏳ Obteniendo tokens...\n');
    
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      console.log('\n⚠️  WARNING: No se obtuvo refresh token');
      console.log('   Posibles causas:');
      console.log('   - Ya autorizaste esta app antes');
      console.log('   - No usaste prompt=consent\n');
      console.log('   SOLUCIÓN:');
      console.log('   1. Ve a: https://myaccount.google.com/permissions');
      console.log('   2. Revoca acceso a "Sistema Barbería"');
      console.log('   3. Vuelve a ejecutar este script\n');
    }
    
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                                                              ║');
    console.log('║                  ✅ TOKENS OBTENIDOS                         ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('Agrega estas líneas a tu archivo .env:\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\x1b[32m%s\x1b[0m', `GMAIL_CLIENT_ID=${CLIENT_ID}`); // Green
    console.log('\x1b[32m%s\x1b[0m', `GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log('\x1b[32m%s\x1b[0m', `GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\x1b[32m%s\x1b[0m', `SENDER_EMAIL=tu-email@gmail.com`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('📝 INFORMACIÓN ADICIONAL:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`Access Token: ${tokens.access_token?.substring(0, 20)}...`);
    console.log(`Expira en: ${tokens.expiry_date ? new Date(tokens.expiry_date).toLocaleString() : 'N/A'}`);
    console.log(`Scope: ${tokens.scope}`);
    console.log('───────────────────────────────────────────────────────────────\n');
    
    console.log('🎉 ¡Listo! Ahora puedes:');
    console.log('  1. Copiar las variables a tu .env');
    console.log('  2. Reiniciar tu servidor backend');
    console.log('  3. Probar el envío con: curl http://localhost:3001/test-gmail');
    console.log('  4. ELIMINAR este script (ya no lo necesitas)\n');
    
  } catch (error) {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                                                              ║');
    console.log('║                     ❌ ERROR                                 ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    if (error.message.includes('invalid_grant')) {
      console.log('El código que pegaste es inválido o expiró.\n');
      console.log('SOLUCIÓN:');
      console.log('  1. Vuelve a abrir la URL de autorización');
      console.log('  2. Obtén un nuevo código');
      console.log('  3. Pégalo rápidamente (expira en ~5 minutos)\n');
    } else if (error.message.includes('redirect_uri_mismatch')) {
      console.log('El Redirect URI no coincide.\n');
      console.log('SOLUCIÓN:');
      console.log('  1. Ve a Google Cloud Console');
      console.log('  2. Credentials → Edita tu OAuth client');
      console.log('  3. Agrega: http://localhost:3000/oauth2callback');
      console.log('  4. Vuelve a ejecutar este script\n');
    } else {
      console.log('Error obteniendo tokens:\n');
      console.error(error);
      console.log('\n');
    }
  }
  
  rl.close();
});

// Manejar Ctrl+C
rl.on('close', () => {
  console.log('\n👋 Script cancelado. Hasta luego!\n');
  process.exit(0);
});
