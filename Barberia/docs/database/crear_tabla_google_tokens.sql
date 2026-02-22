-- Crear tabla para almacenar tokens de Google Calendar de los barberos
-- Esta tabla guarda los access tokens y refresh tokens obtenidos de Google OAuth

CREATE TABLE IF NOT EXISTS public.google_tokens (
  -- Identificador único
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencia al barbero (FK a tabla empleados)
  barbero_id UUID NOT NULL UNIQUE REFERENCES public.empleados(id) ON DELETE CASCADE,
  
  -- Token de acceso (expira en ~1 hora, necesita refresh)
  access_token TEXT NOT NULL,
  
  -- Token para renovar el access_token (válido indefinidamente)
  refresh_token TEXT NOT NULL,
  
  -- Cuándo expira el access_token actual
  fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Última vez que se sincronizó con Google (para detectar problemas)
  fecha_sincronizacion TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Para auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_google_tokens_barbero_id 
  ON public.google_tokens(barbero_id);

CREATE INDEX IF NOT EXISTS idx_google_tokens_expiracion 
  ON public.google_tokens(fecha_expiracion);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_google_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_google_tokens_updated_at 
  ON public.google_tokens;

CREATE TRIGGER trigger_google_tokens_updated_at
  BEFORE UPDATE ON public.google_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_google_tokens_updated_at();

-- Comentarios de documentación
COMMENT ON TABLE public.google_tokens IS 
  'Almacena los tokens de Google Calendar obtenidos tras la autorización OAuth. Uno por barbero.';

COMMENT ON COLUMN public.google_tokens.access_token IS 
  'Token de acceso de corta duración (expira en ~1 hora)';

COMMENT ON COLUMN public.google_tokens.refresh_token IS 
  'Token para obtener nuevos access_tokens sin que el usuario autorize nuevamente';

COMMENT ON COLUMN public.google_tokens.fecha_expiracion IS 
  'Cuándo expira el access_token actual (necesita refresh)';
