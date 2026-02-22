/**
 * SERVICIO DE EMAIL PARA GOOGLE CALENDAR
 * Usa Gmail API (ver gmailService.ts) o Brevo (comentado abajo)
 * 
 * PARA USAR GMAIL API:
 * 1. Importa desde gmailService.ts
 * 2. Configura variables: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
 * 
 * PARA USAR BREVO:
 * 1. Descomenta el código de abajo
 * 2. Configura variable: BREVO_API_KEY
 */

// ============================================
// OPCIÓN 1: GMAIL API (Recomendado)
// ============================================
export { enviarCorreoVinculoGoogle } from './gmailService';

// ============================================
// OPCIÓN 2: BREVO (Descomentar si prefieres)
// ============================================
/*
export async function enviarCorreoVinculoGoogle(
  email: string,
  nombreBarbero: string,
  linkVinculacion: string,
  codigoInvitacion: string
) {
  const asunto = '🔗 Vincula tu Google Calendar - Barbería';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .container {
      max-width: 500px;
      margin: 20px auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px 20px;
    }
    .content p {
      color: #333;
      line-height: 1.6;
      margin-bottom: 15px;
      font-size: 15px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      display: inline-block;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
    .steps {
      background: #f9f9f9;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .step {
      margin: 12px 0;
      color: #555;
      font-size: 14px;
      line-height: 1.5;
    }
    .step strong {
      color: #667eea;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #999;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
    .expiration {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
      font-size: 13px;
      color: #856404;
    }
    .code {
      background: #f0f0f0;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      color: #667eea;
      font-weight: 600;
      word-break: break-all;
    }
    @media (max-width: 480px) {
      .container { margin: 10px; }
      .header { padding: 20px; }
      .header h1 { font-size: 20px; }
      .content { padding: 20px; }
      .button { padding: 14px 30px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔗 Vinculación Google Calendar</h1>
      <p>Conecta tu calendario en un clic</p>
    </div>

    <div class="content">
      <p>Hola <strong>${nombreBarbero}</strong>,</p>

      <p>
        Te enviamos este enlace para vincular tu <strong>Google Calendar</strong> 
        con el sistema de la barbería.
      </p>

      <p>
        Con esto, los turnos que agendes se sincronizarán automáticamente en tu 
        Google Calendar. ¡Mucho más fácil!
      </p>

      <div class="steps">
        <div class="step">
          <strong>Paso 1:</strong> Haz clic en el botón de abajo desde tu celular
        </div>
        <div class="step">
          <strong>Paso 2:</strong> Autoriza el acceso a Google Calendar
        </div>
        <div class="step">
          <strong>Paso 3:</strong> ¡Listo! Tu calendario está vinculado
        </div>
      </div>

      <div class="button-container">
        <a href="${linkVinculacion}" class="button">
          ✓ Vincular Google Calendar
        </a>
      </div>

      <p style="color: #999; text-align: center; font-size: 13px; margin: 20px 0;">
        O copia este enlace en tu navegador:
        <br>
        <span class="code" style="display: block; margin-top: 8px;">${linkVinculacion}</span>
      </p>

      <div class="expiration">
        ⏰ Este enlace es válido por <strong>48 horas</strong>
      </div>

      <p style="font-size: 13px; color: #999;">
        <strong>Código:</strong> <span class="code">${codigoInvitacion.substring(0, 8)}...</span>
      </p>

      <p style="color: #666; font-size: 14px; margin-top: 25px;">
        Si no solicitaste este enlace, simplemente ignora este correo.
      </p>
    </div>

    <div class="footer">
      <p>© 2026 Sistema de Barbería | Todos los derechos reservados</p>
      <p>Este es un correo automático, no respondas directamente</p>
    </div>
  </div>
</body>
</html>
  `;

  // Usar Brevo
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY no configurada');
    throw new Error('Email service not configured');
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        to: [{ email, name: nombreBarbero }],
        sender: {
          email: process.env.SENDER_EMAIL || 'noreply@barberia.com',
          name: 'Sistema Barbería',
        },
        subject: asunto,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error sending email: ${response.statusText}`);
    }

    console.log(`✅ Correo de vinculación Google enviado a ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error enviando correo:', error);
    throw error;
  }
}
*/
