-- ACTUALIZAR TABLA google_tokens EN SUPABASE
-- Ejecuta esto en Supabase → SQL Editor para corregir la tabla existente

-- 1. Agregar constraint UNIQUE en user_id si no existe
ALTER TABLE public.google_tokens
ADD CONSTRAINT google_tokens_user_id_unique UNIQUE (user_id);

-- 2. Agregar columnas que falten si no existen
ALTER TABLE public.google_tokens
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'google',
ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'Bearer',
ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'https://www.googleapis.com/auth/calendar';

-- 3. Asegurar que exista la columna id como PRIMARY KEY
ALTER TABLE public.google_tokens
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- 4. Agregar columnas de auditoría
ALTER TABLE public.google_tokens
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Crear o reemplazar trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_google_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_google_tokens_updated_at ON public.google_tokens;

CREATE TRIGGER trigger_google_tokens_updated_at
  BEFORE UPDATE ON public.google_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_google_tokens_updated_at();

-- 6. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_google_tokens_user_id 
  ON public.google_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_google_tokens_expires_at 
  ON public.google_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_google_tokens_provider 
  ON public.google_tokens(provider);

-- Verificación: Ver estructura de la tabla
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'google_tokens';
