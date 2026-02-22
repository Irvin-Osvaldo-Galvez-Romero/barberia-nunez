# Comandos Rápidos para Supabase

## Configuración Inicial

### 1. Crear archivo .env en frontend/
```bash
# Windows (PowerShell)
cd frontend
New-Item .env

# Linux/Mac
cd frontend
touch .env
```

### 2. Agregar variables de entorno
Edita `frontend/.env` y agrega:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## Comandos SQL Útiles

### Ver todas las tablas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Ver datos de una tabla
```sql
-- Ver empleados
SELECT * FROM empleados;

-- Ver clientes
SELECT * FROM clientes;

-- Ver citas con información relacionada
SELECT 
    c.id,
    c.fecha_hora,
    cl.nombre as cliente_nombre,
    e.nombre as barbero_nombre,
    c.estado
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN empleados e ON c.barbero_id = e.id
ORDER BY c.fecha_hora DESC;
```

### Insertar datos de prueba
```sql
-- Insertar empleado de prueba
INSERT INTO empleados (nombre, email, rol, activo, porcentaje_comision, password_hash) VALUES
    ('Carlos Rodríguez', 'carlos@demo.com', 'BARBERO', true, 40, 'temp'),
    ('María García', 'maria@demo.com', 'BARBERO', true, 35, 'temp'),
    ('Pedro Martínez', 'pedro@demo.com', 'BARBERO', true, 45, 'temp');

-- Insertar cliente de prueba
INSERT INTO clientes (nombre, telefono, email, visitas) VALUES
    ('Juan Pérez', '555-1234', 'juan@email.com', 5),
    ('Ana López', '555-5678', 'ana@email.com', 3),
    ('Luis Sánchez', '555-9012', 'luis@email.com', 1);

-- Insertar servicio de prueba
INSERT INTO servicios (nombre, descripcion, precio, duracion, activo) VALUES
    ('Corte Clásico', 'Corte de cabello tradicional', 20.00, 30, true),
    ('Barba Recortada', 'Arreglo y recorte de barba', 15.00, 20, true),
    ('Tinte Cabello', 'Tinte completo de cabello', 35.00, 60, true);
```

### Actualizar datos
```sql
-- Actualizar porcentaje de comisión de un barbero
UPDATE empleados 
SET porcentaje_comision = 50 
WHERE email = 'carlos@demo.com';

-- Marcar cliente como inactivo
UPDATE clientes 
SET activo = false 
WHERE email = 'juan@email.com';

-- Completar una cita
UPDATE citas 
SET estado = 'COMPLETADA' 
WHERE id = 'id-de-la-cita';
```

### Consultas útiles

```sql
-- Ver citas del día
SELECT 
    c.id,
    c.fecha_hora,
    cl.nombre as cliente,
    e.nombre as barbero,
    c.estado
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN empleados e ON c.barbero_id = e.id
WHERE DATE(c.fecha_hora) = CURRENT_DATE
ORDER BY c.fecha_hora;

-- Ver ganancias de un barbero (citas completadas)
SELECT 
    e.nombre,
    COUNT(c.id) as citas_completadas,
    SUM(
        (SELECT SUM(precio) 
         FROM servicios_citas sc 
         WHERE sc.cita_id = c.id)
    ) as total_ingresos,
    SUM(
        (SELECT SUM(precio) 
         FROM servicios_citas sc 
         WHERE sc.cita_id = c.id) * e.porcentaje_comision / 100
    ) as ganancias_barbero
FROM empleados e
LEFT JOIN citas c ON e.id = c.barbero_id AND c.estado = 'COMPLETADA'
WHERE e.rol = 'BARBERO'
GROUP BY e.id, e.nombre, e.porcentaje_comision;

-- Ver clientes más frecuentes
SELECT 
    nombre,
    visitas,
    ultima_visita
FROM clientes
ORDER BY visitas DESC
LIMIT 10;
```

## Limpiar Datos de Prueba

```sql
-- Eliminar todas las citas
DELETE FROM servicios_citas;
DELETE FROM citas;

-- Eliminar todos los clientes
DELETE FROM clientes;

-- Eliminar todos los servicios
DELETE FROM servicios;

-- Eliminar todos los empleados (excepto si están en uso)
-- DELETE FROM empleados WHERE email != 'admin@barberia.com';
```

## Backup y Restauración

### Exportar datos (desde Supabase Dashboard)
1. Ve a **Database** → **Backups**
2. Click en **Download backup**

### Restaurar desde SQL
1. Ve a **SQL Editor**
2. Pega el script SQL
3. Ejecuta

## Resetear Base de Datos

⚠️ **CUIDADO: Esto eliminará TODOS los datos**

```sql
-- Eliminar todas las tablas en orden
DROP TABLE IF EXISTS servicios_citas CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS empleados CASCADE;
DROP TABLE IF EXISTS horarios CASCADE;
DROP TABLE IF EXISTS informacion_negocio CASCADE;
DROP TABLE IF EXISTS configuracion_general CASCADE;
DROP TABLE IF EXISTS configuracion_notificaciones CASCADE;

-- Luego ejecuta nuevamente el script supabase_schema.sql
```
