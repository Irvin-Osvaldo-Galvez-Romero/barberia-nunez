/**
 * RUTAS PARA VINCULACIÓN DE GOOGLE CALENDAR DESDE CELULAR
 * POST /api/google/generar-invitacion → Envía correo al barbero
 * GET /api/google/callback-barbero → Callback de Google (automático desde celular)
 * GET /api/google/verificar-token/:barberoId → Verifica si está vinculado
 */

import express, { Request, Response } from 'express';
import {
  generarLinkInvitacion,
  procesarCallbackGoogle,
  verificarTokenBarbero,
} from '../services/googleInvitationService';
import { enviarCorreoVinculoGoogle } from '../services/googleEmailService';

const router = express.Router();

/**
 * POST /api/google/generar-invitacion
 * Genera un link único y envía correo al barbero
 * Body: { barberoId, barberoEmail, nombreBarbero }
 */
router.post('/generar-invitacion', async (req: Request, res: Response) => {
  try {
    const { barberoId, barberoEmail, nombreBarbero } = req.body;

    if (!barberoId || !barberoEmail) {
      return res.status(400).json({
        error: 'barberoId y barberoEmail son requeridos',
      });
    }

    // Generar link único
    const { linkCelular, codigoInvitacion, expira } = 
      await generarLinkInvitacion(barberoId, barberoEmail);

    // Enviar correo al barbero
    await enviarCorreoVinculoGoogle(
      barberoEmail,
      nombreBarbero || 'Barbero',
      linkCelular,
      codigoInvitacion
    );

    res.json({
      success: true,
      mensaje: `Correo enviado a ${barberoEmail}`,
      expira,
      codigoInvitacion, // Solo para debugging, no mostrar en producción
    });
  } catch (error) {
    console.error('Error generando invitación:', error);
    res.status(500).json({
      error: 'Error generando invitación',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/google/callback-barbero
 * Callback automático de Google OAuth
 * Se abre automáticamente cuando el barbero autoriza en Google desde el celular
 * 
 * Parámetros:
 *   - code: Código de autorización de Google
 *   - state: Código de invitación (lo pasamos nosotros en state)
 */
router.get('/callback-barbero', async (req: Request, res: Response) => {
  try {
    const { code, state: codigoInvitacion, error: googleError } = req.query;

    // Si Google retorna un error
    if (googleError) {
      console.error('Error de Google:', googleError);
      return res.redirect(
        `${process.env.FRONTEND_URL}/google-error?error=${googleError}`
      );
    }

    if (!code || !codigoInvitacion) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
      });
    }

    // Procesar la autorización y guardar tokens
    const resultado = await procesarCallbackGoogle(
      code as string,
      codigoInvitacion as string
    );

    // Redirigir a página de éxito (mostrar "Conectado" y volver a app de escritorio)
    res.redirect(
      `${process.env.FRONTEND_URL}/google-vinculado?barberoId=${resultado.barberoId}`
    );
  } catch (error) {
    console.error('Error en callback de Google:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    res.redirect(
      `${process.env.FRONTEND_URL}/google-error?error=${encodeURIComponent(mensaje)}`
    );
  }
});

/**
 * GET /api/google/verificar-token/:barberoId
 * Verifica si un barbero tiene Google Calendar vinculado
 * Usado por la app de escritorio para detectar cuando llegó el token
 */
router.get('/verificar-token/:barberoId', async (req: Request, res: Response) => {
  try {
    const { barberoId } = req.params;

    const resultado = await verificarTokenBarbero(barberoId);

    res.json(resultado);
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({
      error: 'Error verificando token',
      vinculado: false,
    });
  }
});

/**
 * POST /api/google/enviar-link-manual
 * Endpoint para que el admin/recepcionista envíe manualmente el link a un barbero
 * Body: { barberoId, barberoEmail, nombreBarbero }
 */
router.post('/enviar-link-manual', async (req: Request, res: Response) => {
  try {
    const { barberoId, barberoEmail, nombreBarbero } = req.body;

    // TODO: Validar que quien hace la request es admin/recepcionista
    // const { user } = req;
    // if (user.rol !== 'admin' && user.rol !== 'recepcionista') {
    //   return res.status(403).json({ error: 'No tienes permiso' });
    // }

    const { linkCelular, expira } = 
      await generarLinkInvitacion(barberoId, barberoEmail);

    await enviarCorreoVinculoGoogle(
      barberoEmail,
      nombreBarbero || 'Barbero',
      linkCelular,
      barberoId
    );

    res.json({
      success: true,
      mensaje: `Link enviado a ${barberoEmail}`,
      expira,
    });
  } catch (error) {
    console.error('Error enviando link manual:', error);
    res.status(500).json({
      error: 'Error enviando link',
    });
  }
});

/**
 * GET /api/google/status
 * Verificar configuración de Gmail
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { verificarConfiguracionGmail } = await import('../services/gmailService.js');
    const status = await verificarConfiguracionGmail();
    
    res.json({
      gmail: status,
      variables: {
        GMAIL_CLIENT_ID: !!process.env.GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET: !!process.env.GMAIL_CLIENT_SECRET,
        GMAIL_REFRESH_TOKEN: !!process.env.GMAIL_REFRESH_TOKEN,
        SENDER_EMAIL: process.env.SENDER_EMAIL || 'no configurado',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error desconocido',
      variables: {
        GMAIL_CLIENT_ID: !!process.env.GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET: !!process.env.GMAIL_CLIENT_SECRET,
        GMAIL_REFRESH_TOKEN: !!process.env.GMAIL_REFRESH_TOKEN,
      },
    });
  }
});

export default router;
