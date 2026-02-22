-- ============================================
-- POLÍTICAS RLS (Row Level Security) PARA SUPABASE
-- ============================================
-- Este script configura las políticas de seguridad para permitir
-- que la aplicación de escritorio pueda leer y escribir en todas las tablas
-- ============================================

-- IMPORTANTE: Si ya tienes RLS habilitado y políticas existentes,
-- este script puede causar conflictos. Revisa primero tus políticas actuales.

-- ============================================
-- OPCIÓN 1: DESHABILITAR RLS (Más simple, menos seguro)
-- ============================================
-- Si prefieres deshabilitar RLS completamente para desarrollo:
-- (No recomendado para producción)

-- ALTER TABLE empleados DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE servicios DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE citas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE servicios_citas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE horarios DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE horarios_negocio DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE informacion_negocio DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE configuracion_general DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE configuracion_notificaciones DISABLE ROW LEVEL SECURITY;

-- ============================================
-- OPCIÓN 2: HABILITAR RLS CON POLÍTICAS PERMISIVAS (Recomendado)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE informacion_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_general ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_notificaciones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA EMPLEADOS
-- ============================================

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Permitir todo en empleados" ON empleados;

-- Crear política permisiva (permite todas las operaciones)
CREATE POLICY "Permitir todo en empleados" ON empleados
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA CLIENTES
-- ============================================

DROP POLICY IF EXISTS "Permitir todo en clientes" ON clientes;

CREATE POLICY "Permitir todo en clientes" ON clientes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA SERVICIOS
-- ============================================

DROP POLICY IF EXISTS "Permitir todo en servicios" ON servicios;

CREATE POLICY "Permitir todo en servicios" ON servicios
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA CITAS
-- ============================================

DROP POLICY IF EXISTS "Permitir todo en citas" ON citas;

CREATE POLICY "Permitir todo en citas" ON citas
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA SERVICIOS_CITAS
-- ============================================

DROP POLICY IF EXISTS "Permitir todo en servicios_citas" ON servicios_citas;

CREATE POLICY "Permitir todo en servicios_citas" ON servicios_citas
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA HORARIOS
-- ============================================

DROP POLICY IF EXISTS "Permitir todo en horarios" ON horarios;

CREATE POLICY "Permitir todo en horarios" ON horarios
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA HORARIOS_NEGOCIO
-- ============================================

DROP POLICY IF EXISTS "Permitir todo en horarios_negocio" ON horarios_negocio;

CREATE POLICY "Permitir todo en horarios_negocio" ON horarios_negocio
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA INFORMACION_NEGOCIO
-- ============================================

DROP POLICY IF EXISTS "Permitir todo en informacion_negocio" ON informacion_negocio;

CREATE POLICY "Permitir todo en informacion_negocio" ON informacion_negocio
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA CONFIGURACION_GENERAL
-- ============================================

DROP POLICY IF EXISTS "Permitir todo en configuracion_general" ON configuracion_general;

CREATE POLICY "Permitir todo en configuracion_general" ON configuracion_general
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA CONFIGURACION_NOTIFICACIONES
-- ============================================

DROP POLICY IF EXISTS "Permitir todo en configuracion_notificaciones" ON configuracion_notificaciones;

CREATE POLICY "Permitir todo en configuracion_notificaciones" ON configuracion_notificaciones
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
