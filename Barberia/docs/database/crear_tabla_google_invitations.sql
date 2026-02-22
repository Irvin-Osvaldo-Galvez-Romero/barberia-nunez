-- Crear tabla para invitaciones de Google Calendar
-- Almacena los códigos únicos que se envían por correo a los barberos

CREATE TABLE IF NOT EXISTS public.google_calendar_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbero_id UUID NOT NULL REFERENCES public.empleados(id) ON DELETE CASCADE,
  barbero_email TEXT NOT NULL,
  codigo_invitacion TEXT NOT NULL UNIQUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_google_invitations_barbero_id 
  ON public.google_calendar_invitations(barbero_id);

CREATE INDEX IF NOT EXISTS idx_google_invitations_codigo 
  ON public.google_calendar_invitations(codigo_invitacion);

CREATE INDEX IF NOT EXISTS idx_google_invitations_email 
  ON public.google_calendar_invitations(barbero_email);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_google_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_google_invitations_updated_at 
  ON public.google_calendar_invitations;

CREATE TRIGGER trigger_google_invitations_updated_at
  BEFORE UPDATE ON public.google_calendar_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_google_invitations_updated_at();

-- Comentarios de documentación
COMMENT ON TABLE public.google_calendar_invitations IS 
  'Almacena códigos únicos de invitación para vincular Google Calendar. Cada código es válido por 48 horas.';

COMMENT ON COLUMN public.google_calendar_invitations.codigo_invitacion IS 
  'Código hexadecimal único generado con crypto.randomBytes(32).toString("hex")';

COMMENT ON COLUMN public.google_calendar_invitations.usado IS 
  'Indica si el código ya fue utilizado para completar la vinculación';
