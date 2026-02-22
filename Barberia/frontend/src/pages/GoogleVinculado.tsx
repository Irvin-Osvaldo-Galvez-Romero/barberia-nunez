/**
 * PÁGINA DE CONFIRMACIÓN: GOOGLE CALENDAR VINCULADO
 * Se muestra después de que Google redirige con el token
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './GoogleVinculado.module.css';

export default function GoogleVinculado() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [contador, setContador] = useState(5);

  const barberoId = searchParams.get('barberoId');

  useEffect(() => {
    // Redirigir a login después de 5 segundos
    const interval = setInterval(() => {
      setContador((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.success}>
          <div className={styles.checkmark}>✓</div>
        </div>

        <h1>¡Conectado!</h1>
        <p className={styles.mainMessage}>
          Google Calendar ha sido vinculado correctamente
        </p>

        <div className={styles.details}>
          <p>
            Ahora los turnos se sincronizarán automáticamente con tu 
            Google Calendar
          </p>
          {barberoId && (
            <p className={styles.barberoId}>
              ID Barbero: <code>{barberoId}</code>
            </p>
          )}
        </div>

        <div className={styles.redirectInfo}>
          <p>
            Volviendo al login en <strong>{contador}</strong> segundos...
          </p>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className={styles.button}
        >
          Ir a Login Ahora
        </button>

        <p className={styles.note}>
          💡 <strong>Nota:</strong> Cierra esta ventana en tu celular. 
          La app de escritorio detectará automáticamente que Google Calendar 
          está vinculado.
        </p>
      </div>
    </div>
  );
}
