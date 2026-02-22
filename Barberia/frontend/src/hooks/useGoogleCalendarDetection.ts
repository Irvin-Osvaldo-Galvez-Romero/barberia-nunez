/**
 * INTEGRACIÓN EN APP ELECTRON
 * Cómo detectar cuando el barbero vinculó Google Calendar desde el celular
 *
 * Usar en: tu Dashboard o componente principal cuando el barbero inicia sesión
 */

import { useEffect, useState } from 'react';

interface UseGoogleCalendarDetectionProps {
  barberoId: string;
  onVinculado?: () => void;
}

/**
 * Hook personalizado para detectar vinculación de Google Calendar
 * Polling automático cada 5 segundos
 */
export function useGoogleCalendarDetection({
  barberoId,
  onVinculado,
}: UseGoogleCalendarDetectionProps) {
  const [vinculado, setVinculado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!barberoId) return;

    let isMounted = true;

    const verificarToken = async () => {
      try {
        const response = await fetch(
          `/api/google/verificar-token/${barberoId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          const estaVinculado = data.vinculado && !data.expirado;

          // Si acaba de vincularse, ejecutar callback
          if (estaVinculado && !vinculado) {
            console.log('✅ Google Calendar vinculado detectado!');
            setVinculado(true);
            onVinculado?.();
          } else {
            setVinculado(estaVinculado);
          }

          setCargando(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error verificando token:', err);
          setError(
            err instanceof Error ? err.message : 'Error desconocido'
          );
          setCargando(false);
        }
      }
    };

    // Verificación inicial
    verificarToken();

    // Polling cada 5 segundos
    const interval = setInterval(verificarToken, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [barberoId, vinculado, onVinculado]);

  return { vinculado, cargando, error };
}

/**
 * Verificación Manual (Sin Polling)
 * Útil si solo quieres verificar una vez
 */
export async function verificarGoogleCalendarManual(
  barberoId: string
): Promise<{
  vinculado: boolean;
  expirado: boolean;
  tieneRefreshToken: boolean;
}> {
  try {
    const response = await fetch(
      `/api/google/verificar-token/${barberoId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      vinculado: data.vinculado,
      expirado: data.expirado,
      tieneRefreshToken: data.tieneRefreshToken,
    };
  } catch (error) {
    console.error('Error verificando token:', error);
    return {
      vinculado: false,
      expirado: true,
      tieneRefreshToken: false,
    };
  }
}

/**
 * Hook para sincronización de Google Calendar
 */
export function useSincronizacionGoogleCalendar({
  barberoId,
}: {
  barberoId: string;
}) {
  const { vinculado } = useGoogleCalendarDetection({
    barberoId,
    onVinculado: async () => {
      console.log('📅 Google Calendar vinculado, sincronizando citas...');

      try {
        // Sincronizar citas existentes
        const response = await fetch(
          `/api/google/sincronizar-citas/${barberoId}`,
          {
            method: 'POST',
          }
        );

        if (response.ok) {
          console.log('✅ Citas sincronizadas');
        }
      } catch (error) {
        console.error('Error sincronizando citas:', error);
      }
    },
  });

  return { vinculado };
}
