/**
 * PÁGINA DE VINCULACIÓN DE GOOGLE CALENDAR DESDE CELULAR
 * Abre automáticamente cuando el barbero hace clic en el correo
 * 
 * Ruta: /google-vincular/:codigoInvitacion
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './GoogleVincular.module.css';

interface EstadoVinculacion {
  estado: 'cargando' | 'error' | 'expirado' | 'listo' | 'vinculando';
  mensaje: string;
  error?: string;
}

// Generar URL de Google OAuth usando el código de invitación
function generarURLGoogleOAuth(codigoInvitacion: string): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  const redirectUri = `${backendUrl}/api/google/callback-barbero`;
  const scope = 'https://www.googleapis.com/auth/calendar';
  const accessType = 'offline';
  const prompt = 'consent';
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: accessType,
    prompt,
    state: codigoInvitacion, // Usar el código como state para validación
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export default function GoogleVincular() {
  const { codigoInvitacion } = useParams();
  const navigate = useNavigate();
  const [estadoVinculacion, setEstadoVinculacion] = useState<EstadoVinculacion>({
    estado: 'cargando',
    mensaje: 'Cargando...',
  });

  useEffect(() => {
    if (!codigoInvitacion) {
      setEstadoVinculacion({
        estado: 'error',
        mensaje: 'Código de invitación inválido',
        error: 'No se recibió el código',
      });
      return;
    }

    // El tiempo es oro: directamente generar URL de Google y redirigir
    try {
      const urlGoogle = generarURLGoogleOAuth(codigoInvitacion);
      
      setEstadoVinculacion({
        estado: 'vinculando',
        mensaje: 'Abriendo Google...',
      });

      // Redirigir a Google (automático)
      window.location.href = urlGoogle;
    } catch (error) {
      setEstadoVinculacion({
        estado: 'error',
        mensaje: 'Error al generar el enlace',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, [codigoInvitacion]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {estadoVinculacion.estado === 'cargando' && (
          <>
            <div className={styles.spinner}></div>
            <h2>Cargando...</h2>
            <p>Preparando vinculación con Google Calendar</p>
          </>
        )}

        {estadoVinculacion.estado === 'vinculando' && (
          <>
            <div className={styles.spinner}></div>
            <h2>Abriendo Google</h2>
            <p>Se abrirá la ventana de Google en un momento</p>
          </>
        )}

        {estadoVinculacion.estado === 'error' && (
          <>
            <div className={styles.error}>❌</div>
            <h2>Error</h2>
            <p>{estadoVinculacion.mensaje}</p>
            {estadoVinculacion.error && (
              <small>{estadoVinculacion.error}</small>
            )}
            <button 
              onClick={() => navigate('/login')}
              className={styles.button}
            >
              Volver al Login
            </button>
          </>
        )}

        {estadoVinculacion.estado === 'expirado' && (
          <>
            <div className={styles.warning}>⏰</div>
            <h2>Invitación Expirada</h2>
            <p>El link de invitación expiró (válido por 48 horas)</p>
            <p>Solicita un nuevo link al administrador</p>
            <button 
              onClick={() => navigate('/login')}
              className={styles.button}
            >
              Volver al Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
