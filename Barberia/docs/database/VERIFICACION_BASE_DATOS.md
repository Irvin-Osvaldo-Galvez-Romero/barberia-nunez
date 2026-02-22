# Verificación de Base de Datos Supabase

## 📊 Análisis del Diagrama Proporcionado

Basado en el diagrama que compartiste, he identificado las siguientes tablas:

### ✅ Tablas Visibles en el Diagrama:
1. **`servicios_citas`** - ✅ Correcta
2. **`citas`** - ✅ Correcta
3. **`empleados`** - ✅ Correcta
4. **`horarios`** - ⚠️ **PROBLEMA**: El código busca `horarios_negocio`
5. **`informacion_negocio`** - ✅ Correcta
6. **`configuracion_general`** - ✅ Correcta

### ❌ Tablas Faltantes en el Diagrama:
1. **`clientes`** - ❌ No visible (pero es necesaria)
2. **`servicios`** - ❌ No visible (pero es necesaria)
3. **`configuracion_notificaciones`** - ❌ No visible (pero es necesaria)

---

## 🔧 Problemas Identificados

### 1. ⚠️ Nombre de Tabla: `horarios` vs `horarios_negocio`

**Problema:**
- El diagrama muestra la tabla como `horarios`
- El código de la aplicación busca `horarios_negocio`

**Solución:**
Ejecuta el script `CORREGIR_BASE_DATOS.sql` que:
- Renombra `horarios` → `horarios_negocio` (recomendado)
- O crea una vista `horarios_negocio` que apunta a `horarios`

### 2. ❌ Tablas Faltantes

**Problema:**
El diagrama no muestra estas tablas, pero son necesarias:
- `clientes` - Para almacenar información de clientes
- `servicios` - Para almacenar los servicios ofrecidos
- `configuracion_notificaciones` - Para configuración de notificaciones

**Solución:**
El script `CORREGIR_BASE_DATOS.sql` creará estas tablas si no existen.

---

## ✅ Tablas que Están Correctas

### 1. `servicios_citas`
- ✅ `id` (uuid, PK)
- ✅ `cita_id` (uuid)
- ✅ `servicio_id` (uuid)
- ✅ `precio` (numeric)
- ✅ `created_at` (timestamptz)

**Nota:** No necesita `updated_at` (correcto según el esquema).

### 2. `citas`
- ✅ `id` (uuid, PK)
- ✅ `cliente_id` (uuid, FK)
- ✅ `barbero_id` (uuid, FK)
- ✅ `fecha_hora` (timestamptz)
- ✅ `duracion` (int4)
- ✅ `estado` (varchar)
- ✅ `notas` (text)
- ✅ `fecha_creacion` (timestamptz)
- ✅ `updated_at` (timestamptz)

### 3. `empleados`
- ✅ `id` (uuid, PK)
- ✅ `nombre` (varchar)
- ✅ `telefono` (varchar)
- ✅ `email` (varchar)
- ✅ `rol` (varchar)
- ✅ `fecha_contratacion` (date)
- ✅ `activo` (bool)
- ✅ `porcentaje_comision` (numeric)
- ✅ `especialidad` (varchar)
- ✅ `password_hash` (varchar)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

### 4. `informacion_negocio`
- ✅ `id` (uuid, PK)
- ✅ `nombre` (varchar)
- ✅ `telefono` (varchar)
- ✅ `email` (varchar)
- ✅ `direccion` (text)
- ✅ `descripcion` (text)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

### 5. `configuracion_general`
- ✅ `id` (uuid, PK)
- ✅ `moneda` (varchar)
- ✅ `formato_fecha` (varchar)
- ✅ `zona_horaria` (varchar)
- ✅ `idioma` (varchar)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

---

## 📋 Checklist de Verificación

Ejecuta este comando en el SQL Editor de Supabase para verificar todas las tablas:

```sql
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
```

**Debes ver estas 9 tablas marcadas como "✅ Requerida":**
1. ✅ `clientes`
2. ✅ `servicios`
3. ✅ `citas`
4. ✅ `empleados`
5. ✅ `servicios_citas`
6. ✅ `horarios_negocio` (o `horarios` si aún no se renombró)
7. ✅ `informacion_negocio`
8. ✅ `configuracion_general`
9. ✅ `configuracion_notificaciones`

---

## 🚀 Pasos para Corregir

1. **Abre el SQL Editor en Supabase**

2. **Ejecuta el script `CORREGIR_BASE_DATOS.sql`**
   - Este script corregirá automáticamente todos los problemas
   - Renombrará `horarios` → `horarios_negocio`
   - Creará las tablas faltantes si no existen

3. **Verifica que todas las tablas existen**
   - Ejecuta el comando de verificación anterior
   - Asegúrate de que todas las 9 tablas estén presentes

4. **Prueba la aplicación**
   - Intenta crear un cliente
   - Intenta crear un servicio
   - Intenta crear una cita
   - Verifica que todo funcione correctamente

---

## 📝 Resumen

**Estado Actual:**
- ⚠️ Tabla `horarios` debe renombrarse a `horarios_negocio`
- ❌ Faltan 3 tablas: `clientes`, `servicios`, `configuracion_notificaciones`
- ✅ Las demás tablas visibles están correctas

**Acción Requerida:**
Ejecuta `CORREGIR_BASE_DATOS.sql` en Supabase para corregir todo automáticamente.
