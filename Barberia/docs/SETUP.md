# Guía de Configuración - Sistema de Barbería

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase creada
- Git (opcional)

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Obtén tus credenciales de Supabase:
   - Ve a tu proyecto en [Supabase](https://supabase.com)
   - Ve a Settings > API
   - Copia la URL del proyecto y la clave anónima (anon key)

3. Edita el archivo `.env` y agrega tus credenciales:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

### 3. Configurar Base de Datos en Supabase

Necesitas crear las siguientes tablas en Supabase. Ve a SQL Editor y ejecuta el siguiente script:

```sql
-- Tabla de empleados
CREATE TABLE empleados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(255),
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'BARBERO', 'RECEPCIONISTA')),
  fecha_contratacion DATE DEFAULT CURRENT_DATE,
  activo BOOLEAN DEFAULT true,
  porcentaje_comision DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios (vinculada con auth.users de Supabase)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empleado_id UUID REFERENCES empleados(id),
  username VARCHAR(100) NOT NULL UNIQUE,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'BARBERO', 'RECEPCIONISTA')),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(255),
  fecha_nacimiento DATE,
  fecha_registro DATE DEFAULT CURRENT_DATE,
  notas TEXT,
  preferencias TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de servicios
CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  duracion INTEGER NOT NULL, -- en minutos
  categoria VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de citas
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  barbero_id UUID NOT NULL REFERENCES empleados(id),
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion INTEGER NOT NULL, -- en minutos
  estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE' 
    CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO')),
  notas TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación citas-servicios
CREATE TABLE servicios_citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cita_id UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id),
  precio DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_citas_barbero ON citas(barbero_id);
CREATE INDEX idx_citas_cliente ON citas(cliente_id);
CREATE INDEX idx_citas_fecha ON citas(fecha_hora);
CREATE INDEX idx_citas_estado ON citas(estado);
CREATE INDEX idx_usuarios_empleado ON usuarios(empleado_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_citas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de seguridad (ajustar según necesidades)
-- Los usuarios solo pueden ver sus propios datos
CREATE POLICY "Users can view own data" ON usuarios
  FOR SELECT USING (auth.uid() = id);

-- Los barberos pueden ver sus propias citas
CREATE POLICY "Barbers can view own appointments" ON citas
  FOR SELECT USING (
    barbero_id IN (
      SELECT empleado_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Los administradores pueden ver todo
CREATE POLICY "Admins can view all" ON citas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'ADMINISTRADOR'
    )
  );
```

### 4. Crear Usuario de Prueba

1. Ve a Authentication > Users en Supabase
2. Crea un nuevo usuario manualmente o usa el signup
3. Anota el ID del usuario creado
4. Crea un empleado y un usuario en las tablas:

```sql
-- Insertar empleado de prueba
INSERT INTO empleados (nombre, email, rol, porcentaje_comision)
VALUES ('Juan Pérez', 'juan@barberia.com', 'BARBERO', 30.00)
RETURNING id;

-- Insertar usuario (reemplaza 'user-id-aqui' con el ID del usuario de auth)
INSERT INTO usuarios (id, empleado_id, username, rol)
VALUES (
  'user-id-aqui', -- ID del usuario de auth.users
  (SELECT id FROM empleados WHERE email = 'juan@barberia.com'),
  'juan',
  'BARBERO'
);
```

## 🏃 Ejecutar la Aplicación

### Modo Desarrollo

```bash
npm run dev
```

Esto iniciará:
- El servidor de desarrollo de Vite (React) en http://localhost:5173
- La aplicación Electron

### Compilar para Producción

```bash
npm run build
```

Los archivos compilados estarán en:
- `dist/` - Frontend React
- `dist-electron/` - Electron main process

## 📁 Estructura del Proyecto

```
barberia-app/
├── electron/          # Código de Electron (main process)
│   ├── main.ts       # Proceso principal
│   └── preload.ts    # Preload script
├── src/              # Código React/TypeScript
│   ├── components/   # Componentes reutilizables
│   ├── pages/        # Páginas/vistas
│   ├── stores/       # Estado global (Zustand)
│   ├── lib/          # Utilidades y configuraciones
│   └── App.tsx       # Componente principal
├── package.json
└── vite.config.ts
```

## 🔧 Solución de Problemas

### Error: "Variables de entorno de Supabase no configuradas"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Asegúrate de que las variables empiecen con `VITE_`

### Error de conexión a Supabase
- Verifica que la URL y la clave anónima sean correctas
- Asegúrate de que tu proyecto de Supabase esté activo

### Error al iniciar Electron
- Asegúrate de tener Node.js 18+ instalado
- Ejecuta `npm install` nuevamente
- Verifica que el puerto 5173 esté disponible

## 📚 Próximos Pasos

1. ✅ Configurar base de datos
2. ✅ Crear usuarios de prueba
3. ✅ Probar login
4. ⏳ Implementar más funcionalidades
5. ⏳ Integración con Google Calendar
6. ⏳ Notificaciones por Email

## 🆘 Soporte

Si tienes problemas, verifica:
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Electron](https://www.electronjs.org/docs)
- [Documentación de React](https://react.dev)
