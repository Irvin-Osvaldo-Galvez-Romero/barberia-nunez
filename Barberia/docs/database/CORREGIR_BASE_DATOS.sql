-- ============================================
-- CORRECCIÓN DE BASE DE DATOS SUPABASE
-- ============================================
-- Este script corrige las diferencias entre el diagrama mostrado
-- y el esquema esperado por la aplicación
-- ============================================

-- ============================================
-- PROBLEMA 1: La tabla se llama "horarios" pero el código busca "horarios_negocio"
-- ============================================

-- Opción 1: Renombrar la tabla (RECOMENDADO)
DO $$
BEGIN
    -- Verificar si existe "horarios" y no existe "horarios_negocio"
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'horarios'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'horarios_negocio'
    ) THEN
        -- Renombrar la tabla
        ALTER TABLE horarios RENAME TO horarios_negocio;
        RAISE NOTICE '✅ Tabla "horarios" renombrada a "horarios_negocio"';
        
        -- Renombrar el trigger si existe
        DROP TRIGGER IF EXISTS update_horarios_updated_at ON horarios_negocio;
        CREATE TRIGGER update_horarios_negocio_updated_at BEFORE UPDATE ON horarios_negocio
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '✅ Trigger actualizado para "horarios_negocio"';
    ELSE
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'horarios_negocio'
        ) THEN
            RAISE NOTICE '✅ La tabla "horarios_negocio" ya existe';
        ELSE
            RAISE NOTICE '⚠️  La tabla "horarios" no existe. Creando "horarios_negocio"...';
            CREATE TABLE IF NOT EXISTS horarios_negocio (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                dia_semana VARCHAR(20) NOT NULL UNIQUE CHECK (dia_semana IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO')),
                hora_apertura TIME NOT NULL,
                hora_cierre TIME NOT NULL,
                activo BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                CHECK (hora_cierre > hora_apertura)
            );
            CREATE TRIGGER update_horarios_negocio_updated_at BEFORE UPDATE ON horarios_negocio
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            RAISE NOTICE '✅ Tabla "horarios_negocio" creada';
        END IF;
    END IF;
END $$;

-- ============================================
-- PROBLEMA 2: Verificar que existen todas las tablas necesarias
-- ============================================

-- Verificar y crear tabla "clientes" si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clientes'
    ) THEN
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
        CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '✅ Tabla "clientes" creada';
    ELSE
        RAISE NOTICE '✅ Tabla "clientes" ya existe';
    END IF;
END $$;

-- Verificar y crear tabla "servicios" si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'servicios'
    ) THEN
        CREATE TABLE IF NOT EXISTS servicios (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
            duracion INTEGER NOT NULL CHECK (duracion > 0),
            categoria VARCHAR(50) DEFAULT 'General',
            activo BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON servicios
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '✅ Tabla "servicios" creada';
    ELSE
        RAISE NOTICE '✅ Tabla "servicios" ya existe';
    END IF;
END $$;

-- Verificar y crear tabla "configuracion_notificaciones" si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'configuracion_notificaciones'
    ) THEN
        CREATE TABLE IF NOT EXISTS configuracion_notificaciones (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            recordatorio_citas BOOLEAN NOT NULL DEFAULT true,
            confirmacion_automatica BOOLEAN NOT NULL DEFAULT false,
            recordatorio_horas_antes INTEGER NOT NULL DEFAULT 24 CHECK (recordatorio_horas_antes > 0 AND recordatorio_horas_antes <= 168),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TRIGGER update_configuracion_notificaciones_updated_at BEFORE UPDATE ON configuracion_notificaciones
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '✅ Tabla "configuracion_notificaciones" creada';
    ELSE
        RAISE NOTICE '✅ Tabla "configuracion_notificaciones" ya existe';
    END IF;
END $$;

-- ============================================
-- PROBLEMA 3: Verificar que servicios_citas tiene la estructura correcta
-- ============================================

-- Verificar que servicios_citas no tiene updated_at (no es necesario)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'servicios_citas' 
        AND column_name = 'updated_at'
    ) THEN
        -- No es un error, pero no es necesario según el esquema
        RAISE NOTICE 'ℹ️  Tabla "servicios_citas" tiene "updated_at" (opcional, no causa problemas)';
    ELSE
        RAISE NOTICE '✅ Tabla "servicios_citas" sin "updated_at" (correcto)';
    END IF;
END $$;

-- ============================================
-- RESUMEN FINAL
-- ============================================

SELECT 
    '✅ Verificación completada' AS resultado,
    'Revisa los mensajes anteriores para ver qué se corrigió' AS mensaje;

-- Listar todas las tablas para verificación
SELECT 
    table_name AS "Tabla",
    CASE 
        WHEN table_name IN ('clientes', 'servicios', 'citas', 'empleados', 'servicios_citas', 
                            'horarios_negocio', 'informacion_negocio', 'configuracion_general', 
                            'configuracion_notificaciones') 
        THEN '✅ Requerida'
        ELSE '⚠️  No requerida'
    END AS "Estado"
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name IN ('clientes', 'servicios', 'citas', 'empleados', 'servicios_citas', 
                            'horarios_negocio', 'informacion_negocio', 'configuracion_general', 
                            'configuracion_notificaciones') 
        THEN 0
        ELSE 1
    END,
    table_name;
