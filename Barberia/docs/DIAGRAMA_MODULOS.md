# 📊 Diagrama de Módulos del Sistema de Barbería

## 🏗️ Arquitectura de Módulos

```mermaid
graph TB
    subgraph "🔐 Módulo 1: Autenticación"
        A1[Login Page]
        A2[Auth Store]
        A3[User Profile]
        A1 --> A2
        A2 --> A3
    end

    subgraph "👥 Módulo 2: Clientes"
        B1[Clientes Page]
        B2[Clientes Store]
        B3[Cliente Form]
        B4[Cliente Historial]
        B1 --> B2
        B1 --> B3
        B1 --> B4
        B2 --> B3
    end

    subgraph "✂️ Módulo 3: Servicios"
        C1[Servicios Page]
        C2[Servicios Store]
        C3[Servicio Form]
        C1 --> C2
        C1 --> C3
        C2 --> C3
    end

    subgraph "👨‍💼 Módulo 4: Empleados"
        D1[Empleados Page]
        D2[Empleados Store]
        D3[Empleado Form]
        D1 --> D2
        D1 --> D3
        D2 --> D3
    end

    subgraph "📅 Módulo 5: Citas"
        E1[Citas Page]
        E2[Citas Store]
        E3[Cita Form]
        E4[Calendario]
        E1 --> E2
        E1 --> E3
        E1 --> E4
        E2 --> E3
        E2 --> B2
        E2 --> C2
        E2 --> D2
    end

    subgraph "🎨 Componentes Compartidos"
        F1[Layout]
        F2[Sidebar]
        F3[Header]
        F1 --> F2
        F1 --> F3
    end

    A1 --> F1
    B1 --> F1
    C1 --> F1
    D1 --> F1
    E1 --> F1

    style A1 fill:#6366f1,stroke:#4f46e5,color:#fff
    style B1 fill:#10b981,stroke:#059669,color:#fff
    style C1 fill:#f59e0b,stroke:#d97706,color:#fff
    style D1 fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style E1 fill:#ec4899,stroke:#db2777,color:#fff
    style F1 fill:#64748b,stroke:#475569,color:#fff
```

## 📱 Estructura de Páginas y Navegación

```mermaid
graph LR
    Start[Login] --> Auth{Autenticado?}
    Auth -->|Sí| Dashboard[Dashboard]
    Auth -->|No| Start
    
    Dashboard --> Clientes[Clientes]
    Dashboard --> Servicios[Servicios]
    Dashboard --> Empleados[Empleados]
    Dashboard --> Citas[Citas]
    
    Clientes --> ClienteForm[Form Cliente]
    Servicios --> ServicioForm[Form Servicio]
    Empleados --> EmpleadoForm[Form Empleado]
    Citas --> CitaForm[Form Cita]
    
    style Start fill:#ef4444,stroke:#dc2626,color:#fff
    style Dashboard fill:#6366f1,stroke:#4f46e5,color:#fff
    style Clientes fill:#10b981,stroke:#059669,color:#fff
    style Servicios fill:#f59e0b,stroke:#d97706,color:#fff
    style Empleados fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style Citas fill:#ec4899,stroke:#db2777,color:#fff
```

## 🔄 Flujo de Datos

```mermaid
graph TB
    subgraph "Frontend"
        UI[Interfaz de Usuario]
        Store[Zustand Stores]
        Components[Componentes React]
    end
    
    subgraph "Backend"
        Supabase[Supabase API]
        DB[(PostgreSQL Database)]
    end
    
    UI --> Components
    Components --> Store
    Store --> Supabase
    Supabase --> DB
    DB --> Supabase
    Supabase --> Store
    Store --> Components
    Components --> UI
    
    style UI fill:#6366f1,stroke:#4f46e5,color:#fff
    style Store fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style Supabase fill:#10b981,stroke:#059669,color:#fff
    style DB fill:#f59e0b,stroke:#d97706,color:#fff
```

## 📂 Estructura de Archivos por Módulo

```
frontend/src/
├── 📁 pages/
│   ├── Login.tsx                    # 🔐 Módulo 1
│   ├── Dashboard.tsx
│   ├── Clientes.tsx                 # 👥 Módulo 2
│   ├── Servicios.tsx                # ✂️ Módulo 3
│   ├── Empleados.tsx                # 👨‍💼 Módulo 4
│   └── Citas.tsx                    # 📅 Módulo 5
│
├── 📁 components/
│   ├── Layout.tsx                   # 🎨 Compartido
│   ├── Sidebar.tsx                  # 🎨 Compartido
│   ├── Header.tsx                   # 🎨 Compartido
│   ├── ClienteForm.tsx              # 👥 Módulo 2
│   ├── ClienteHistorial.tsx         # 👥 Módulo 2
│   ├── ServicioForm.tsx             # ✂️ Módulo 3
│   ├── EmpleadoForm.tsx             # 👨‍💼 Módulo 4
│   └── CitaForm.tsx                 # 📅 Módulo 5
│
├── 📁 stores/
│   ├── authStore.ts                 # 🔐 Módulo 1
│   ├── clientesStore.ts             # 👥 Módulo 2
│   ├── serviciosStore.ts            # ✂️ Módulo 3
│   ├── empleadosStore.ts            # 👨‍💼 Módulo 4
│   └── citasStore.ts                # 📅 Módulo 5
│
└── 📁 lib/
    └── supabase.ts                  # 🔧 Compartido
```

## 🎯 Dependencias entre Módulos

```mermaid
graph TD
    A[🔐 Autenticación] --> B[👥 Clientes]
    A --> C[✂️ Servicios]
    A --> D[👨‍💼 Empleados]
    A --> E[📅 Citas]
    
    B --> E
    C --> E
    D --> E
    
    style A fill:#6366f1,stroke:#4f46e5,color:#fff
    style B fill:#10b981,stroke:#059669,color:#fff
    style C fill:#f59e0b,stroke:#d97706,color:#fff
    style D fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style E fill:#ec4899,stroke:#db2777,color:#fff
```

## 📋 Orden de Implementación

```mermaid
graph LR
    A[1. Autenticación] --> B[2. Clientes]
    B --> C[3. Servicios]
    C --> D[4. Empleados]
    D --> E[5. Citas]
    
    style A fill:#6366f1,stroke:#4f46e5,color:#fff
    style B fill:#10b981,stroke:#059669,color:#fff
    style C fill:#f59e0b,stroke:#d97706,color:#fff
    style D fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style E fill:#ec4899,stroke:#db2777,color:#fff
```

## 🔑 Funcionalidades por Módulo

### 🔐 Módulo 1: Autenticación
- ✅ Login/Logout
- ✅ Gestión de sesión
- ✅ Roles (Admin, Barbero, Recepcionista)
- ✅ Protección de rutas

### 👥 Módulo 2: Clientes
- ✅ CRUD completo
- ✅ Búsqueda
- ✅ Historial de citas
- ✅ Información de contacto

### ✂️ Módulo 3: Servicios
- ✅ CRUD completo
- ✅ Precios y duración
- ✅ Categorías
- ✅ Activar/Desactivar

### 👨‍💼 Módulo 4: Empleados
- ✅ CRUD completo
- ✅ Asignación de roles
- ✅ Especialidades
- ✅ Estado activo/inactivo

### 📅 Módulo 5: Citas
- ✅ Crear/Editar/Cancelar
- ✅ Calendario diario/semanal
- ✅ Asignar barbero
- ✅ Seleccionar servicios
- ✅ Estados de cita
- ✅ Notas

## 🎨 Componentes Compartidos

- **Layout**: Estructura principal de la app
- **Sidebar**: Navegación lateral
- **Header**: Barra superior con búsqueda y usuario
- **Form Components**: Formularios reutilizables

## 📊 Base de Datos (Supabase)

```mermaid
erDiagram
    USUARIOS ||--o{ EMPLEADOS : tiene
    CLIENTES ||--o{ CITAS : tiene
    SERVICIOS ||--o{ CITAS_SERVICIOS : tiene
    EMPLEADOS ||--o{ CITAS : atiende
    CITAS ||--o{ CITAS_SERVICIOS : contiene
    
    USUARIOS {
        string id PK
        string email
        string rol
    }
    
    CLIENTES {
        string id PK
        string nombre
        string telefono
        string email
    }
    
    SERVICIOS {
        string id PK
        string nombre
        decimal precio
        int duracion
    }
    
    EMPLEADOS {
        string id PK
        string nombre
        string rol
        string especialidad
    }
    
    CITAS {
        string id PK
        string cliente_id FK
        string barbero_id FK
        datetime fecha_hora
        string estado
    }
    
    CITAS_SERVICIOS {
        string cita_id FK
        string servicio_id FK
    }
```
