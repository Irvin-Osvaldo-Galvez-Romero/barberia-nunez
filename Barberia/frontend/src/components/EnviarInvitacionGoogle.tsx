/**
 * EJEMPLO: Componente para Enviar Invitación Google Calendar
 * Usar en el módulo de Administración o Gestión de Barberos
 */

import { useState } from 'react';
import styles from './EnviarInvitacionGoogle.module.css';

interface Barbero {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
}

interface EnviarInvitacionGoogleProps {
  barbero: Barbero;
  onSuccess?: () => void;
}

export default function EnviarInvitacionGoogle({
  barbero,
  onSuccess,
}: EnviarInvitacionGoogleProps) {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const handleEnviarInvitacion = async () => {
    setCargando(true);
    setMensaje(null);

    try {
      // 1. Generar el link en el backend
      const generateResponse = await fetch('/api/google/generar-invitacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barberoId: barbero.id,
          barberoEmail: barbero.email,
          nombreBarbero: barbero.nombre,
        }),
      });

      if (!generateResponse.ok) {
        throw new Error(
          `Error generando invitación: ${generateResponse.statusText}`
        );
      }

      const { codigoInvitacion, expira } = await generateResponse.json();

      // 2. Construir el link completo
      const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173';
      const linkVinculacion = `${frontendUrl}/google-vincular/${codigoInvitacion}`;

      // 3. Enviar el correo
      const emailResponse = await fetch('/api/google/enviar-email-invitacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: barbero.email,
          nombre: barbero.nombre,
          linkVinculacion: linkVinculacion,
          codigoInvitacion: codigoInvitacion,
          expira: expira,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error(`Error enviando correo: ${emailResponse.statusText}`);
      }

      setMensaje({
        tipo: 'success',
        texto: `✅ Invitación enviada a ${barbero.email}. Válida por 48 horas.`,
      });

      // Ejecutar callback si existe
      onSuccess?.();

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMensaje(null), 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      setMensaje({
        tipo: 'error',
        texto: `❌ Error: ${errorMessage}`,
      });
      console.error('Error enviando invitación:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h3>🔗 Vincular Google Calendar</h3>
          <p className={styles.barberoInfo}>
            <strong>{barbero.nombre}</strong> • {barbero.email}
          </p>
        </div>

        <div className={styles.content}>
          <p className={styles.descripcion}>
            Envía un enlace mágico a {barbero.nombre} para que vincule su Google
            Calendar desde el celular sin necesidad de abrir la app de escritorio.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.icon}>📧</span>
              <span>Recibe enlace por email</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.icon}>📱</span>
              <span>Click desde celular</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.icon}>✅</span>
              <span>Se vincula automáticamente</span>
            </div>
          </div>

          {mensaje && (
            <div
              className={`${styles.mensaje} ${styles[`mensaje_${mensaje.tipo}`]}`}
            >
              {mensaje.texto}
            </div>
          )}

          <button
            className={styles.boton}
            onClick={handleEnviarInvitacion}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className={styles.spinner}></span>
                Enviando...
              </>
            ) : (
              <>
                <span className={styles.icon}>📬</span>
                Enviar Invitación por Email
              </>
            )}
          </button>

          <p className={styles.nota}>
            ℹ️ El enlace es válido por 48 horas. El barbero recibirá un correo
            con todas las instrucciones.
          </p>
        </div>
      </div>
    </div>
  );
}
