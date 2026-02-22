/**
 * SERVICIO DE INVITACIÓN PARA VINCULACIÓN DE GOOGLE CALENDAR
 * Flujo: Correo → Celular → Google OAuth → Token guardado → App de escritorio lo detecta
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Log temporal para debugging
console.log('🔧 [GOOGLE OAUTH CONFIG]');
console.log('   FRONTEND_URL:', FRONTEND_URL);
console.log('   BACKEND_URL:', BACKEND_URL);
console.log('   REDIRECT_URI:', `${BACKEND_URL}/api/google/callback-barbero`);

/**
 * Generar link de invitación único para barbero
 * Este link se envía por correo al celular del barbero
 */
export async function generarLinkInvitacion(barberoId: string, barberoEmail: string) {
  try {
    // Generar código único
    const codigoInvitacion = crypto.randomBytes(32).toString('hex');
    
    // Guardar en BD con expiración de 48 horas
    const ahora = new Date();
    const expiracion = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);
    
    const { error } = await supabase
      .from('google_calendar_invitations')
      .insert({
        barbero_id: barberoId,
        barbero_email: barberoEmail,
        codigo_invitacion: codigoInvitacion,
        fecha_creacion: ahora.toISOString(),
        fecha_expiracion: expiracion.toISOString(),
        usado: false,
      });

    if (error) {
      console.error('❌ Error en BD (google_calendar_invitations):', error);
      
      // Mejorar mensaje de error
      if (error.code === 'PGRST205') {
        throw new Error(
          'La tabla google_calendar_invitations no existe en la base de datos. ' +
          'Ejecuta el SQL en docs/database/crear_tabla_google_invitations.sql en Supabase Dashboard.'
        );
      }
      throw error;
    }

    // Retornar link que abre en celular
    const linkCelular = `${FRONTEND_URL}/google-vincular/${codigoInvitacion}`;
    
    console.log(`✅ Link de invitación generado para ${barberoEmail}`);
    
    return {
      linkCelular,
      codigoInvitacion,
      expira: expiracion,
    };
  } catch (error) {
    console.error('Error generando link de invitación:', error);
    throw error;
  }
}

/**
 * Iniciar OAuth de Google (desde celular)
 * Retorna URL de Google para que el usuario autorice
 */
export function generarURLGoogleOAuth(codigoInvitacion: string) {
  const scope = 'https://www.googleapis.com/auth/calendar';
  const redirect_uri = `${BACKEND_URL}/api/google/callback-barbero`;
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri,
    response_type: 'code',
    scope,
    state: codigoInvitacion, // Pasamos el código en state para validar después
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Callback de Google (recibe el código de autorización)
 * Se ejecuta automáticamente después que el usuario autoriza en Google
 */
export async function procesarCallbackGoogle(code: string, codigoInvitacion: string) {
  try {
    // 1. Verificar que la invitación existe y no ha expirado
    const { data: invitacion, error: errorInvitacion } = await supabase
      .from('google_calendar_invitations')
      .select('*')
      .eq('codigo_invitacion', codigoInvitacion)
      .single();

    if (errorInvitacion || !invitacion) {
      throw new Error('Invitación inválida o expirada');
    }

    // Verificar que no ha expirado
    if (new Date(invitacion.fecha_expiracion) < new Date()) {
      throw new Error('Invitación expirada');
    }

    // Verificar que no ha sido usado
    if (invitacion.usado) {
      throw new Error('Invitación ya fue utilizada');
    }

    // 2. Intercambiar código por tokens de Google
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${BACKEND_URL}/api/google/callback-barbero`,
    });

    const { access_token, refresh_token, expires_in, token_type, scope } = response.data;

    // 3. Calcular fecha de expiración del access token
    const ahora = new Date();
    const fechaExpiracionToken = new Date(ahora.getTime() + expires_in * 1000);

    // 4. Guardar tokens en google_tokens asociados al barbero
    // Primero verificar si ya existe un token para este barbero
    const { data: tokenExistente } = await supabase
      .from('google_tokens')
      .select('id')
      .eq('user_id', invitacion.barbero_id)
      .single();

    let errorToken;
    
    if (tokenExistente) {
      // Si existe, actualizar
      const resultado = await supabase
        .from('google_tokens')
        .update({
          access_token,
          refresh_token,
          expires_at: fechaExpiracionToken.toISOString(),
          provider: 'google',
          token_type: token_type || 'Bearer',
          scope: scope || 'https://www.googleapis.com/auth/calendar',
        })
        .eq('user_id', invitacion.barbero_id);
      errorToken = resultado.error;
    } else {
      // Si no existe, insertar
      const resultado = await supabase
        .from('google_tokens')
        .insert({
          user_id: invitacion.barbero_id,
          access_token,
          refresh_token,
          expires_at: fechaExpiracionToken.toISOString(),
          provider: 'google',
          token_type: token_type || 'Bearer',
          scope: scope || 'https://www.googleapis.com/auth/calendar',
        });
      errorToken = resultado.error;
    }

    if (errorToken) throw errorToken;

    // 5. Marcar invitación como usada
    await supabase
      .from('google_calendar_invitations')
      .update({ usado: true, fecha_confirmacion: ahora.toISOString() })
      .eq('codigo_invitacion', codigoInvitacion);

    return {
      success: true,
      barberoId: invitacion.barbero_id,
      mensaje: 'Google Calendar vinculado correctamente',
    };
  } catch (error) {
    console.error('Error procesando callback de Google:', error);
    throw error;
  }
}

/**
 * Verificar si un barbero ya tiene Google Calendar vinculado
 * (Para que la app de escritorio lo detecte)
 */
export async function verificarTokenBarbero(barberoId: string) {
  try {
    const { data, error } = await supabase
      .from('google_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', barberoId)
      .single();

    if (error || !data) {
      return { vinculado: false };
    }

    // Verificar si el token expiró
    const fechaExpiracion = new Date(data.expires_at);
    const ahora = new Date();
    const expirado = fechaExpiracion < ahora;

    return {
      vinculado: true,
      expirado,
      tieneRefreshToken: !!data.refresh_token,
    };
  } catch (error) {
    console.error('Error verificando token:', error);
    return { vinculado: false, error: true };
  }
}

/**
 * Limpiar invitaciones expiradas (ejecutar periódicamente)
 */
export async function limpiarInvitacionesExpiradas() {
  try {
    const ahora = new Date().toISOString();

    const { error } = await supabase
      .from('google_calendar_invitations')
      .delete()
      .lt('fecha_expiracion', ahora)
      .eq('usado', false);

    if (error) throw error;

    console.log('✅ Invitaciones expiradas limpiadas');
  } catch (error) {
    console.error('Error limpiando invitaciones:', error);
  }
}
