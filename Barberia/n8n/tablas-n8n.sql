-- ============================================
-- TABLAS ADICIONALES PARA N8N
-- ============================================

-- Tabla para rastrear recordatorios enviados
-- Evita enviar el mismo recordatorio múltiples veces
CREATE TABLE IF NOT EXISTS recordatorios_enviados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cita_id UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('24h', '1h')),
  enviado_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cita_id, tipo)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_recordatorios_cita_tipo ON recordatorios_enviados(cita_id, tipo);

-- ============================================

-- Tabla opcional para logs de backups
-- Registra cada backup realizado
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archivo VARCHAR(255) NOT NULL,
  tamaño_kb DECIMAL(10, 2),
  status VARCHAR(20) NOT NULL DEFAULT 'EXITOSO' CHECK (status IN ('EXITOSO', 'FALLIDO', 'PARCIAL')),
  mensaje TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_backup_logs_fecha ON backup_logs(fecha DESC);

-- ============================================

-- NOTAS:
-- 
-- 1. recordatorios_enviados: 
--    - Se llena automáticamente por n8n
--    - Se puede limpiar periódicamente (ej: registros mayores a 30 días)
--
-- 2. backup_logs:
--    - OPCIONAL: Solo si quieres rastrear los backups
--    - Útil para auditoría y debugging
--
-- ============================================

-- Limpieza automática (opcional, ejecutar mensualmente):

-- Eliminar recordatorios antiguos (mayores a 30 días)
-- DELETE FROM recordatorios_enviados 
-- WHERE enviado_at < NOW() - INTERVAL '30 days';

-- Eliminar logs de backup antiguos (mayores a 90 días)
-- DELETE FROM backup_logs 
-- WHERE fecha < NOW() - INTERVAL '90 days';
