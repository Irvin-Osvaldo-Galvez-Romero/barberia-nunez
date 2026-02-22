# Base de Datos - Documentación

Esta carpeta contiene toda la documentación y scripts relacionados con la base de datos Supabase.

## Archivos

- **`supabase_schema.sql`**: Script SQL completo para crear todas las tablas, índices, triggers y datos iniciales
- **`SETUP_SUPABASE.md`**: Guía completa paso a paso para configurar Supabase
- **`comandos_rapidos.md`**: Comandos SQL útiles y consultas comunes

## Inicio Rápido

1. Lee `SETUP_SUPABASE.md` para la configuración inicial
2. Ejecuta `supabase_schema.sql` en el SQL Editor de Supabase
3. Configura las variables de entorno en `frontend/.env`
4. Consulta `comandos_rapidos.md` para comandos útiles

## Estructura de la Base de Datos

### Tablas Principales

- **empleados**: Administradores, barberos y recepcionistas
- **clientes**: Clientes de la barbería
- **servicios**: Servicios ofrecidos (cortes, barbas, etc.)
- **citas**: Agendamientos de citas
- **servicios_citas**: Relación muchos a muchos entre citas y servicios
- **horarios**: Horarios de trabajo de la barbería
- **informacion_negocio**: Información básica del negocio
- **configuracion_general**: Configuración general de la aplicación
- **configuracion_notificaciones**: Configuración de notificaciones

### Relaciones

- Una cita pertenece a un cliente y un barbero
- Una cita puede tener múltiples servicios (a través de servicios_citas)
- Los barberos tienen un porcentaje de comisión configurado
