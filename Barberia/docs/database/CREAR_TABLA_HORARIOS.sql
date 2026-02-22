-- Script para crear la tabla horarios_negocio en Supabase
-- Esta tabla almacena los horarios de atención del negocio

-- Crear la tabla horarios_negocio
CREATE TABLE IF NOT EXISTS public.horarios_negocio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana VARCHAR(20) NOT NULL UNIQUE CHECK (dia_semana IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO')),
  hora_apertura TIME NOT NULL,
  hora_cierre TIME NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CHECK (hora_cierre > hora_apertura)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_horarios_negocio_dia_semana ON public.horarios_negocio(dia_semana);
CREATE INDEX IF NOT EXISTS idx_horarios_negocio_activo ON public.horarios_negocio(activo);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.horarios_negocio ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY "Permitir lectura de horarios a usuarios autenticados"
  ON public.horarios_negocio
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserción solo a administradores
CREATE POLICY "Permitir inserción de horarios a administradores"
  ON public.horarios_negocio
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.empleados
      WHERE empleados.id = auth.uid()
      AND empleados.rol = 'ADMINISTRADOR'
    )
  );

-- Política para permitir actualización solo a administradores
CREATE POLICY "Permitir actualización de horarios a administradores"
  ON public.horarios_negocio
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.empleados
      WHERE empleados.id = auth.uid()
      AND empleados.rol = 'ADMINISTRADOR'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.empleados
      WHERE empleados.id = auth.uid()
      AND empleados.rol = 'ADMINISTRADOR'
    )
  );

-- Política para permitir eliminación solo a administradores
CREATE POLICY "Permitir eliminación de horarios a administradores"
  ON public.horarios_negocio
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.empleados
      WHERE empleados.id = auth.uid()
      AND empleados.rol = 'ADMINISTRADOR'
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_horarios_negocio_updated_at
  BEFORE UPDATE ON public.horarios_negocio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar horarios por defecto (si no existen)
-- NOTA: Ajusta estos horarios según las necesidades de tu negocio
INSERT INTO public.horarios_negocio (dia_semana, hora_apertura, hora_cierre, activo)
VALUES
  ('LUNES', '09:00:00', '20:00:00', true),
  ('MARTES', '09:00:00', '20:00:00', true),
  ('MIERCOLES', '09:00:00', '20:00:00', true),
  ('JUEVES', '09:00:00', '20:00:00', true),
  ('VIERNES', '09:00:00', '20:00:00', true),
  ('SABADO', '09:00:00', '18:00:00', true),
  ('DOMINGO', '10:00:00', '16:00:00', false)
ON CONFLICT (dia_semana) DO NOTHING;
