# Configuración de Supabase para la Aplicación

Esta guía te ayudará a configurar correctamente Supabase para que todas las tablas puedan ser modificadas desde la aplicación de escritorio.

## ⚠️ IMPORTANTE: Verificaciones Necesarias

### 1. Verificar que todas las tablas existen

Ejecuta este comando en el **SQL Editor** de Supabase para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Debes ver estas tablas:**
- ✅ `citas`
- ✅ `clientes`
- ✅ `configuracion_general`
- ✅ `configuracion_notificaciones`
- ✅ `empleados`
- ✅ `horarios` (o `horarios_negocio`)
- ✅ `informacion_negocio`
- ✅ `servicios`
- ✅ `servicios_citas`

### 2. Verificar el nombre de la tabla de horarios

La aplicación usa `horarios_negocio`, pero el esquema original define `horarios`. 

**Si tu tabla se llama `horarios`**, necesitas crear un alias o renombrarla:

```sql
-- Opción 1: Crear una vista con el nombre esperado
CREATE OR REPLACE VIEW horarios_negocio AS SELECT * FROM horarios;

-- Opción 2: Renombrar la tabla (si no tienes datos importantes)
-- ALTER TABLE horarios RENAME TO horarios_negocio;
```

**O si tu tabla se llama `horarios_negocio`**, está correcto.

### 3. Configurar Row Level Security (RLS)

**IMPORTANTE**: Si RLS está habilitado sin políticas, **NO podrás acceder a las tablas**.

Tienes dos opciones:

#### Opción A: Deshabilitar RLS (Más simple para desarrollo)

Ejecuta este script en el **SQL Editor**:

```sql
ALTER TABLE empleados DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE servicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE citas DISABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_citas DISABLE ROW LEVEL SECURITY;
ALTER TABLE horarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_negocio DISABLE ROW LEVEL SECURITY;
ALTER TABLE informacion_negocio DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_general DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_notificaciones DISABLE ROW LEVEL SECURITY;
```

#### Opción B: Habilitar RLS con políticas permisivas (Recomendado)

Ejecuta el archivo `docs/database/POLITICAS_RLS.sql` completo en el **SQL Editor** de Supabase.

Este script:
- Habilita RLS en todas las tablas
- Crea políticas que permiten todas las operaciones (SELECT, INSERT, UPDATE, DELETE)

### 4. Verificar que las políticas están activas

Ejecuta este comando para ver todas las políticas:

```sql
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Debes ver políticas para todas las tablas** con `cmd = 'ALL'` o políticas separadas para SELECT, INSERT, UPDATE, DELETE.

## 🔧 Solución de Problemas

### Error: "permission denied for table X"

**Causa**: RLS está habilitado pero no hay políticas que permitan el acceso.

**Solución**: Ejecuta el script `POLITICAS_RLS.sql` o deshabilita RLS temporalmente.

### Error: "relation 'horarios_negocio' does not exist"

**Causa**: La tabla se llama `horarios` pero el código busca `horarios_negocio`.

**Solución**: 
1. Verifica el nombre real de tu tabla con el comando de verificación
2. Si es `horarios`, crea la vista o renombra la tabla (ver paso 2)

### Error: "null value in column X violates not-null constraint"

**Causa**: Estás intentando insertar un registro sin un campo requerido.

**Solución**: Verifica que todos los campos requeridos (NOT NULL) tengan valores antes de insertar.

### Las operaciones funcionan pero los cambios no se guardan

**Causa**: Puede ser un problema de caché o las políticas RLS no permiten UPDATE.

**Solución**: 
1. Verifica las políticas RLS con el comando del paso 4
2. Asegúrate de que hay políticas para UPDATE
3. Recarga la aplicación

## 📋 Checklist de Configuración

- [ ] Todas las tablas existen en Supabase
- [ ] La tabla de horarios tiene el nombre correcto (`horarios_negocio` o vista creada)
- [ ] RLS está deshabilitado O tiene políticas permisivas configuradas
- [ ] Las variables de entorno están configuradas en `frontend/.env`
- [ ] La aplicación se conecta correctamente (no muestra "Modo DEMO")
- [ ] Puedes crear, leer, actualizar y eliminar registros desde la app

## 🚀 Próximos Pasos

Una vez configurado todo:

1. **Prueba crear un cliente** desde la app
2. **Prueba crear un servicio** desde la app
3. **Prueba crear una cita** desde la app
4. **Verifica en Supabase** que los datos se guardaron correctamente

Si todo funciona, ¡tu configuración está completa! 🎉
