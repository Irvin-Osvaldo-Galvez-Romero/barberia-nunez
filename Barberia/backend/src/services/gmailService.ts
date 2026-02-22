/**
 * SERVICIO DE ENVÍO DE EMAILS CON GMAIL API (OAuth 2.0)
 * Alternativa a Brevo usando la cuenta de Gmail del sistema
 */

import 'dotenv/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Cliente OAuth2 global (se inicializa una vez)
let oauth2Client: OAuth2Client | null = null;

/**
 * Inicializa el cliente OAuth2 de Gmail
 * Debe llamarse al inicio del servidor
 */
export function inicializarGmailOAuth() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('⚠️ Gmail API no configurado. Faltan variables:');
    if (!clientId) console.warn('  - GMAIL_CLIENT_ID');
    if (!clientSecret) console.warn('  - GMAIL_CLIENT_SECRET');
    if (!refreshToken) console.warn('  - GMAIL_REFRESH_TOKEN');
    return null;
  }

  try {
    oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost' // Redirect URI (no se usa para refresh token)
    );

    // Configurar el refresh token
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    console.log('✅ Gmail API inicializado correctamente');
    console.log(`   Email: ${process.env.SENDER_EMAIL || 'no configurado'}`);
    return oauth2Client;
  } catch (error) {
    console.error('❌ Error inicializando Gmail API:', error);
    return null;
  }
}
/**
 * Obtiene el cliente Gmail configurado
 */
function getGmailClient() {
  if (!oauth2Client) {
    throw new Error('Gmail API no está configurado. Llama a inicializarGmailOAuth() primero.');
  }

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Codifica el mensaje en formato RFC 2822
 */
function crearMensajeRaw(
  to: string,
  subject: string,
  htmlContent: string,
  from?: string
): string {
  const fromEmail = from || process.env.SENDER_EMAIL || 'noreply@barberia.com';
  
  const message = [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlContent,
  ].join('\n');

  // Codificar en base64url
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return encodedMessage;
}

/**
 * ENVIAR CORREO DE VINCULACIÓN GOOGLE CALENDAR
 * Igual que googleEmailService.ts pero usando Gmail API
 */
export async function enviarCorreoVinculoGoogle(
  email: string,
  nombreBarbero: string,
  linkVinculacion: string,
  codigoInvitacion: string
) {
  const asunto = ' Vincula tu Google Calendar - Barberia';

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

  try {
    const gmail = getGmailClient();
    const raw = crearMensajeRaw(email, asunto, html);

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: raw,
      },
    });

    console.log(`✅ Correo de vinculación Google enviado a ${email} (ID: ${result.data.id})`);
    return { success: true, messageId: result.data.id };
  } catch (error) {
    console.error('❌ Error enviando correo con Gmail API:', error);
    throw error;
  }
}

/**
 * ENVIAR CORREO GENÉRICO
 * Para cualquier otro tipo de correo
 */
export async function enviarCorreo(
  to: string,
  subject: string,
  htmlContent: string,
  from?: string
) {
  try {
    const gmail = getGmailClient();
    const raw = crearMensajeRaw(to, subject, htmlContent, from);

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: raw,
      },
    });

    console.log(`✅ Correo enviado a ${to} (ID: ${result.data.id})`);
    return { success: true, messageId: result.data.id };
  } catch (error) {
    console.error('❌ Error enviando correo con Gmail API:', error);
    throw error;
  }
}

/**
 * VERIFICAR CONFIGURACIÓN
 * Útil para debugging
 */
export async function verificarConfiguracionGmail(): Promise<{
  configurado: boolean;
  email?: string;
  error?: string;
}> {
  try {
    if (!oauth2Client) {
      oauth2Client = inicializarGmailOAuth();
    }

    if (!oauth2Client) {
      return {
        configurado: false,
        error: 'Variables de entorno no configuradas',
      };
    }

    const gmail = getGmailClient();
    const profile = await gmail.users.getProfile({ userId: 'me' });

    return {
      configurado: true,
      email: profile.data.emailAddress || 'desconocido',
    };
  } catch (error) {
    return {
      configurado: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
