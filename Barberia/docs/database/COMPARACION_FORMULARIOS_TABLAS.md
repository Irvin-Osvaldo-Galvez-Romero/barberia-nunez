# Comparación: Formularios vs Tablas de Supabase

Este documento compara los campos de los formularios de la aplicación con las tablas de Supabase para asegurar que coincidan.

## 📋 Resumen General

| Módulo | Estado | Observaciones |
|--------|--------|---------------|
| **Clientes** | ✅ Compatible | Falta campo "direccion" en formulario (opcional en BD) |
| **Servicios** | ✅ Perfecto | Coincide 100% |
| **Empleados** | ✅ Perfecto | Coincide 100% (password → password_hash) |
| **Citas** | ✅ Perfecto | Coincide 100% (fecha+hora → fecha_hora) |
| **Horarios** | ✅ Perfecto | Coincide 100% |
| **Información Negocio** | ✅ Perfecto | Coincide 100% |
| **Configuración General** | ✅ Perfecto | Coincide 100% |
| **Configuración Notificaciones** | ✅ Perfecto | Coincide 100% |

---

## 1. 📝 CLIENTES

### Formulario (`Clientes.tsx`)
- ✅ `nombre` (text, requerido)
- ✅ `telefono` (tel, requerido)
- ✅ `email` (email, opcional)
- ✅ `notas` (textarea, opcional)
- ❌ `direccion` (NO está en el formulario)

### Tabla `clientes` en Supabase
- ✅ `nombre` VARCHAR(255) NOT NULL
- ✅ `telefono` VARCHAR(50)
- ✅ `email` VARCHAR(255)
- ✅ `direccion` TEXT (opcional)
- ✅ `notas` TEXT
- ✅ `visitas` INTEGER DEFAULT 0 (calculado automáticamente)
- ✅ `ultima_visita` DATE (calculado automáticamente)
- ✅ `activo` BOOLEAN DEFAULT true
- ✅ `fecha_registro` DATE DEFAULT CURRENT_DATE

### ⚠️ Diferencia
- La tabla tiene `direccion` pero el formulario no la incluye.
- **Solución**: El campo es opcional en la BD, así que no causa problemas. Si deseas agregarlo al formulario, puedes hacerlo editando `frontend/src/pages/Clientes.tsx`.

---

## 2. ✂️ SERVICIOS

### Formulario (`Servicios.tsx`)
- ✅ `nombre` (text, requerido)
- ✅ `categoria` (select, requerido)
- ✅ `precio` (number, requerido)
- ✅ `duracion` (number, requerido)
- ✅ `descripcion` (textarea, opcional)
- ✅ `activo` (checkbox, default: true)

### Tabla `servicios` en Supabase
- ✅ `nombre` VARCHAR(255) NOT NULL
- ✅ `categoria` VARCHAR(50) DEFAULT 'General'
- ✅ `precio` DECIMAL(10,2) NOT NULL
- ✅ `duracion` INTEGER NOT NULL
- ✅ `descripcion` TEXT
- ✅ `activo` BOOLEAN DEFAULT true

### ✅ Coincide perfectamente

---

## 3. 👥 EMPLEADOS

### Formulario (`Empleados.tsx`)
- ✅ `nombre` (text, requerido)
- ✅ `email` (email, opcional)
- ✅ `telefono` (tel, opcional)
- ✅ `password` (password, requerido al crear, opcional al editar)
- ✅ `rol` (select, requerido)
- ✅ `fecha_contratacion` (date, requerido)
- ✅ `activo` (checkbox, default: true)
- ✅ `porcentaje_comision` (number, solo si rol = BARBERO)
- ✅ `especialidad` (text, solo si rol = BARBERO)

### Tabla `empleados` en Supabase
- ✅ `nombre` VARCHAR(255) NOT NULL
- ✅ `email` VARCHAR(255) UNIQUE NOT NULL
- ✅ `telefono` VARCHAR(50)
- ✅ `password_hash` VARCHAR(255) NOT NULL (mapeado desde `password`)
- ✅ `rol` VARCHAR(20) NOT NULL
- ✅ `fecha_contratacion` DATE NOT NULL
- ✅ `activo` BOOLEAN DEFAULT true
- ✅ `porcentaje_comision` DECIMAL(5,2)
- ✅ `especialidad` VARCHAR(255)

### ✅ Coincide perfectamente
- El campo `password` del formulario se mapea a `password_hash` en la base de datos mediante el código en `empleadosStore.ts`.

---

## 4. 📅 CITAS

### Formulario (`Citas.tsx`)
- ✅ `cliente_id` (búsqueda de cliente, requerido)
- ✅ `fecha` (date, requerido)
- ✅ `hora` (time, requerido)
- ✅ `barbero_id` (select, requerido)
- ✅ `servicios` (checkboxes, array de IDs, requerido)
- ✅ `estado` (select, default: PENDIENTE)
- ✅ `notas` (textarea, opcional)

### Tabla `citas` en Supabase
- ✅ `cliente_id` UUID NOT NULL (FK)
- ✅ `barbero_id` UUID NOT NULL (FK)
- ✅ `fecha_hora` TIMESTAMPTZ NOT NULL (combinación de fecha + hora)
- ✅ `duracion` INTEGER NOT NULL (calculado de los servicios)
- ✅ `estado` VARCHAR(20) DEFAULT 'PENDIENTE'
- ✅ `notas` TEXT

### Tabla `servicios_citas` (relación muchos a muchos)
- ✅ `cita_id` UUID NOT NULL (FK)
- ✅ `servicio_id` UUID NOT NULL (FK)
- ✅ `precio` DECIMAL(10,2) NOT NULL

### ✅ Coincide perfectamente
- `fecha` y `hora` del formulario se combinan en `fecha_hora` (TIMESTAMPTZ) en la BD.
- `duracion` se calcula automáticamente sumando las duraciones de los servicios seleccionados.
- Los servicios se guardan en la tabla `servicios_citas`.

---

## 5. ⏰ HORARIOS

### Formulario (`Configuracion.tsx` - Tab Horarios)
- ✅ `dia_semana` (LUNES, MARTES, etc.)
- ✅ `hora_apertura` (time)
- ✅ `hora_cierre` (time)
- ✅ `activo` (checkbox)

### Tabla `horarios_negocio` en Supabase
- ✅ `dia_semana` VARCHAR(20) NOT NULL UNIQUE
- ✅ `hora_apertura` TIME NOT NULL
- ✅ `hora_cierre` TIME NOT NULL
- ✅ `activo` BOOLEAN DEFAULT true

### ✅ Coincide perfectamente

---

## 6. 🏢 INFORMACIÓN DEL NEGOCIO

### Formulario (`Configuracion.tsx` - Tab Negocio)
- ✅ `nombre` (text, requerido)
- ✅ `telefono` (tel, requerido)
- ✅ `email` (email, requerido)
- ✅ `direccion` (text, requerido)
- ✅ `descripcion` (textarea, opcional)

### Tabla `informacion_negocio` en Supabase
- ✅ `nombre` VARCHAR(255) NOT NULL
- ✅ `telefono` VARCHAR(50)
- ✅ `email` VARCHAR(255)
- ✅ `direccion` TEXT
- ✅ `descripcion` TEXT

### ✅ Coincide perfectamente

---

## 7. ⚙️ CONFIGURACIÓN GENERAL

### Formulario (`Configuracion.tsx` - Tab General)
- ✅ `moneda` (select: USD, MXN, EUR, COP)
- ✅ `formato_fecha` (select: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- ✅ `zona_horaria` (select: varias opciones)
- ✅ `idioma` (select: es, en)

### Tabla `configuracion_general` en Supabase
- ✅ `moneda` VARCHAR(10) DEFAULT 'USD'
- ✅ `formato_fecha` VARCHAR(20) DEFAULT 'DD/MM/YYYY'
- ✅ `zona_horaria` VARCHAR(100) DEFAULT 'America/Mexico_City'
- ✅ `idioma` VARCHAR(10) DEFAULT 'es'

### ✅ Coincide perfectamente

---

## 8. 🔔 CONFIGURACIÓN DE NOTIFICACIONES

### Formulario (`Configuracion.tsx` - Tab Notificaciones)
- ✅ `recordatorio_citas` (checkbox)
- ✅ `confirmacion_automatica` (checkbox)
- ✅ `recordatorio_horas_antes` (number, 1-168)

### Tabla `configuracion_notificaciones` en Supabase
- ✅ `recordatorio_citas` BOOLEAN DEFAULT true
- ✅ `confirmacion_automatica` BOOLEAN DEFAULT false
- ✅ `recordatorio_horas_antes` INTEGER DEFAULT 24

### ✅ Coincide perfectamente

---

## 🎯 Conclusión

**Todas las tablas están correctamente estructuradas y coinciden con los formularios.**

La única diferencia menor es:
- **Clientes**: La tabla tiene `direccion` pero el formulario no la incluye (es opcional, no causa problemas).

Si deseas agregar el campo `direccion` al formulario de clientes, puedes hacerlo editando `frontend/src/pages/Clientes.tsx`.

---

## 📝 Script SQL de Verificación

Ejecuta el archivo `ACTUALIZAR_TABLAS_SUPABASE.sql` en el SQL Editor de Supabase para:
1. Verificar que todas las tablas existen
2. Verificar que tienen los campos correctos
3. Crear la tabla `horarios_negocio` si no existe
4. Asegurar que `password_hash` existe en `empleados`
