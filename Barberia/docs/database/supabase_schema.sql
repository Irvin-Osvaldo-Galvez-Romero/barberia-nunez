-- ============================================
-- ESQUEMA DE BASE DE DATOS PARA BARBERÍA
-- Supabase (PostgreSQL)
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: empleados
-- ============================================
CREATE TABLE IF NOT EXISTS empleados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'BARBERO', 'RECEPCIONISTA')),
    fecha_contratacion DATE NOT NULL DEFAULT CURRENT_DATE,
    activo BOOLEAN NOT NULL DEFAULT true,
    porcentaje_comision DECIMAL(5,2) CHECK (porcentaje_comision >= 0 AND porcentaje_comision <= 100),
    especialidad VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255),
    direccion TEXT,
    visitas INTEGER NOT NULL DEFAULT 0,
    ultima_visita DATE,
    activo BOOLEAN NOT NULL DEFAULT true,
    notas TEXT,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: servicios
-- ============================================
CREATE TABLE IF NOT EXISTS servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    duracion INTEGER NOT NULL CHECK (duracion > 0), -- en minutos
    categoria VARCHAR(50) DEFAULT 'General',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: citas
-- ============================================
CREATE TABLE IF NOT EXISTS citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    barbero_id UUID NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
    fecha_hora TIMESTAMPTZ NOT NULL,
    duracion INTEGER NOT NULL CHECK (duracion > 0), -- en minutos
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO')),
    notas TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: servicios_citas (Relación muchos a muchos)
-- ============================================
CREATE TABLE IF NOT EXISTS servicios_citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cita_id UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
    servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE RESTRICT,
    precio DECIMAL(10,2) NOT NULL, -- Precio al momento de la cita (puede cambiar)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cita_id, servicio_id)
);

-- ============================================
-- TABLA: horarios
-- ============================================
CREATE TABLE IF NOT EXISTS horarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dia_semana VARCHAR(20) NOT NULL UNIQUE CHECK (dia_semana IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO')),
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (hora_cierre > hora_apertura)
);

-- ============================================
-- TABLA: informacion_negocio
-- ============================================
CREATE TABLE IF NOT EXISTS informacion_negocio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255),
    direccion TEXT,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: configuracion_general
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion_general (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moneda VARCHAR(10) NOT NULL DEFAULT 'USD' CHECK (moneda IN ('USD', 'MXN', 'EUR', 'COP')),
    formato_fecha VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY' CHECK (formato_fecha IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
    zona_horaria VARCHAR(100) NOT NULL DEFAULT 'America/Mexico_City',
    idioma VARCHAR(10) NOT NULL DEFAULT 'es' CHECK (idioma IN ('es', 'en')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: configuracion_notificaciones
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion_notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recordatorio_citas BOOLEAN NOT NULL DEFAULT true,
    confirmacion_automatica BOOLEAN NOT NULL DEFAULT false,
    recordatorio_horas_antes INTEGER NOT NULL DEFAULT 24 CHECK (recordatorio_horas_antes > 0 AND recordatorio_horas_antes <= 168),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para mejorar el rendimiento
-- ============================================

-- Índices para empleados
CREATE INDEX IF NOT EXISTS idx_empleados_email ON empleados(email);
CREATE INDEX IF NOT EXISTS idx_empleados_rol ON empleados(rol);
CREATE INDEX IF NOT EXISTS idx_empleados_activo ON empleados(activo);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);

-- Índices para citas
CREATE INDEX IF NOT EXISTS idx_citas_cliente_id ON citas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_citas_barbero_id ON citas(barbero_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora ON citas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora_barbero ON citas(fecha_hora, barbero_id);

-- Índices para servicios_citas
CREATE INDEX IF NOT EXISTS idx_servicios_citas_cita_id ON servicios_citas(cita_id);
CREATE INDEX IF NOT EXISTS idx_servicios_citas_servicio_id ON servicios_citas(servicio_id);

-- ============================================
-- FUNCIONES para updated_at automático
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON servicios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horarios_updated_at BEFORE UPDATE ON horarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_informacion_negocio_updated_at BEFORE UPDATE ON informacion_negocio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracion_general_updated_at BEFORE UPDATE ON configuracion_general
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracion_notificaciones_updated_at BEFORE UPDATE ON configuracion_notificaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES (Opcional)
-- ============================================

-- Insertar horarios por defecto
INSERT INTO horarios (dia_semana, hora_apertura, hora_cierre, activo) VALUES
    ('LUNES', '09:00', '20:00', true),
    ('MARTES', '09:00', '20:00', true),
    ('MIERCOLES', '09:00', '20:00', true),
    ('JUEVES', '09:00', '20:00', true),
    ('VIERNES', '09:00', '20:00', true),
    ('SABADO', '09:00', '18:00', true),
    ('DOMINGO', '10:00', '16:00', false)
ON CONFLICT (dia_semana) DO NOTHING;

-- Insertar información del negocio por defecto (solo si no existe)
INSERT INTO informacion_negocio (nombre, telefono, email, direccion, descripcion)
SELECT 'Mi Barbería', '+1234567890', 'info@mibarberia.com', 'Calle Falsa 123, Ciudad, País', 'La mejor barbería de la ciudad.'
WHERE NOT EXISTS (SELECT 1 FROM informacion_negocio);

-- Insertar configuración general por defecto (solo si no existe)
INSERT INTO configuracion_general (moneda, formato_fecha, zona_horaria, idioma)
SELECT 'USD', 'DD/MM/YYYY', 'America/Mexico_City', 'es'
WHERE NOT EXISTS (SELECT 1 FROM configuracion_general);

-- Insertar configuración de notificaciones por defecto (solo si no existe)
INSERT INTO configuracion_notificaciones (recordatorio_citas, confirmacion_automatica, recordatorio_horas_antes)
SELECT true, false, 24
WHERE NOT EXISTS (SELECT 1 FROM configuracion_notificaciones);

-- ============================================
-- COMENTARIOS EN TABLAS (Documentación)
-- ============================================

COMMENT ON TABLE empleados IS 'Tabla de empleados (administradores, barberos, recepcionistas)';
COMMENT ON TABLE clientes IS 'Tabla de clientes de la barbería';
COMMENT ON TABLE servicios IS 'Tabla de servicios ofrecidos';
COMMENT ON TABLE citas IS 'Tabla de citas/agendamientos';
COMMENT ON TABLE servicios_citas IS 'Tabla de relación muchos a muchos entre citas y servicios';
COMMENT ON TABLE horarios IS 'Tabla de horarios de trabajo de la barbería';
COMMENT ON TABLE informacion_negocio IS 'Información básica del negocio';
COMMENT ON TABLE configuracion_general IS 'Configuración general de la aplicación';
COMMENT ON TABLE configuracion_notificaciones IS 'Configuración de notificaciones';
