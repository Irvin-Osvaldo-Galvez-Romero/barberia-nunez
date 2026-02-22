# Roles y Permisos - Sistema de Gestión de Barbería

## 🎭 Roles del Sistema

### **Roles que Acceden a la App de Escritorio**

#### 1. **ADMINISTRADOR** 👑
**Acceso completo al sistema**

**Permisos:**
- ✅ Gestión completa de clientes (crear, editar, eliminar)
- ✅ Gestión completa de citas (crear, modificar, cancelar)
- ✅ Gestión de servicios y precios
- ✅ Gestión de empleados y barberos
- ✅ Configuración del sistema
- ✅ Acceso a todos los reportes y estadísticas
- ✅ Gestión de usuarios y permisos
- ✅ Configuración de horarios del negocio
- ✅ Ver todas las ventas y transacciones
- ✅ Modificar configuraciones del sistema
- ✅ Backup y restauración de datos

**Casos de uso:**
- Configurar precios y servicios
- Contratar/nuevos barberos
- Ver reportes financieros completos
- Configurar horarios de operación
- Gestionar promociones y descuentos

---

#### 2. **BARBERO** ✂️
**Acceso limitado a funciones operativas**

**Permisos:**
- ✅ Ver sus propias citas del día/semana
- ✅ Ver información de clientes asignados
- ✅ Marcar citas como completadas
- ✅ Registrar servicios realizados
- ✅ Ver su historial de servicios
- ✅ Ver sus comisiones y rendimiento
- ✅ Actualizar su perfil personal
- ❌ NO puede crear/modificar/cancelar citas (solo ver)
- ❌ NO puede modificar precios
- ❌ NO puede ver reportes financieros completos
- ❌ NO puede gestionar otros empleados
- ❌ NO puede acceder a configuraciones del sistema

**Casos de uso:**
- Ver agenda del día
- Consultar información del cliente antes del servicio
- Registrar servicios completados
- Ver cuánto ha ganado en comisiones
- Actualizar disponibilidad personal

---

#### 3. **RECEPCIONISTA** 📞
**Acceso a funciones de atención al cliente**

**Permisos:**
- ✅ Crear, modificar y cancelar citas
- ✅ Registrar nuevos clientes
- ✅ Buscar y actualizar información de clientes
- ✅ Ver calendario completo (todos los barberos)
- ✅ Procesar pagos y generar recibos
- ✅ Ver reportes básicos (citas del día, ingresos del día)
- ✅ Enviar recordatorios de citas
- ✅ Gestionar lista de espera
- ❌ NO puede modificar precios de servicios
- ❌ NO puede gestionar empleados
- ❌ NO puede ver reportes financieros detallados
- ❌ NO puede acceder a configuraciones del sistema
- ❌ NO puede eliminar clientes (solo desactivar)

**Casos de uso:**
- Atender llamadas y crear citas
- Registrar nuevos clientes
- Procesar pagos en caja
- Imprimir recibos
- Gestionar el calendario de citas
- Enviar confirmaciones a clientes

---

### **Roles que NO Acceden a la App de Escritorio**

#### 4. **CLIENTE** 👤
**NO usa la app de escritorio del negocio**

**Acceso alternativo:**
- 📱 **App móvil** (opcional) o **Web app** para:
  - Ver sus citas programadas
  - Reservar nuevas citas
  - Ver historial de servicios
  - Cancelar/modificar sus propias citas
  - Ver promociones disponibles
  - Calificar servicios recibidos

**Razón:** Los clientes no necesitan acceso a la app de escritorio del negocio. Ellos interactúan a través de:
- Llamadas telefónicas
- Presencia física en la barbería
- App móvil/web (si se implementa)

---

## 🏗️ Arquitectura de Acceso Recomendada

```
┌─────────────────────────────────────────────────────────┐
│              APLICACIÓN DE ESCRITORIO                   │
│         (Para personal del negocio)                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │Administrador │  │  Barbero     │  │Recepcionista │ │
│  │  (Acceso     │  │  (Acceso     │  │  (Acceso     │ │
│  │  Completo)   │  │  Limitado)   │  │  Intermedio) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │
                        │ API REST
                        │
┌─────────────────────────────────────────────────────────┐
│                    BACKEND API                           │
│              (Mismo backend para todos)                  │
└─────────────────────────────────────────────────────────┘
                        │
                        │
┌─────────────────────────────────────────────────────────┐
│              APLICACIÓN MÓVIL/WEB                        │
│            (Para clientes - Opcional)                    │
│                                                          │
│  ┌──────────────┐                                       │
│  │   Cliente    │                                       │
│  │  (Solo sus   │                                       │
│  │   propias    │                                       │
│  │   funciones) │                                       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Matriz de Permisos Detallada

| Funcionalidad | Administrador | Barbero | Recepcionista | Cliente (App Móvil) |
|---------------|:-------------:|:-------:|:-------------:|:-------------------:|
| **Gestión de Clientes** |
| Crear cliente | ✅ | ❌ | ✅ | ❌ |
| Editar cliente | ✅ | ❌ | ✅ | Solo propio |
| Eliminar cliente | ✅ | ❌ | ❌ | ❌ |
| Ver todos los clientes | ✅ | ❌ | ✅ | ❌ |
| Ver historial completo | ✅ | Solo asignados | ✅ | Solo propio |
| **Gestión de Citas** |
| Crear cita | ✅ | ❌ | ✅ | Solo propia |
| Modificar cita | ✅ | ❌ | ✅ | Solo propia |
| Cancelar cita | ✅ | ❌ | ✅ | Solo propia |
| Ver todas las citas | ✅ | Solo propias | ✅ | Solo propias |
| Confirmar cita | ✅ | ✅ | ✅ | ❌ |
| **Gestión de Servicios** |
| Crear servicio | ✅ | ❌ | ❌ | ❌ |
| Modificar precio | ✅ | ❌ | ❌ | ❌ |
| Ver servicios | ✅ | ✅ | ✅ | ✅ |
| **Gestión de Empleados** |
| Crear empleado | ✅ | ❌ | ❌ | ❌ |
| Modificar empleado | ✅ | Solo propio | ❌ | ❌ |
| Ver todos los empleados | ✅ | ✅ | ✅ | ✅ |
| **Punto de Venta** |
| Registrar venta | ✅ | ✅ | ✅ | ❌ |
| Procesar pago | ✅ | ✅ | ✅ | ❌ |
| Generar recibo | ✅ | ✅ | ✅ | ❌ |
| Aplicar descuentos | ✅ | ❌ | ✅ | ❌ |
| **Reportes** |
| Reportes financieros | ✅ | ❌ | Básicos | ❌ |
| Estadísticas completas | ✅ | Solo propias | Básicas | ❌ |
| Exportar datos | ✅ | ❌ | ❌ | ❌ |
| **Configuración** |
| Configurar sistema | ✅ | ❌ | ❌ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ | ❌ |
| Configurar horarios | ✅ | ❌ | ❌ | ❌ |
| Backup/Restore | ✅ | ❌ | ❌ | ❌ |

---

## 💡 Recomendaciones de Diseño

### **1. Pantalla de Login**
- Todos los usuarios (Admin, Barbero, Recepcionista) inician sesión en la misma app
- El sistema detecta el rol y muestra el menú correspondiente
- Interfaz adaptada según permisos

### **2. Dashboard Personalizado por Rol**

**Administrador:**
- Vista completa del negocio
- Métricas globales
- Acceso a todas las funciones

**Barbero:**
- Vista enfocada en sus citas del día
- Lista de clientes asignados
- Sus estadísticas personales

**Recepcionista:**
- Vista del calendario completo
- Panel de atención al cliente
- Procesamiento rápido de pagos

### **3. Navegación Adaptativa**
- Menú lateral que cambia según el rol
- Solo muestra opciones permitidas
- Iconos y colores diferenciados

### **4. Validación en Backend**
- **IMPORTANTE:** No confiar solo en el frontend
- Validar permisos en cada endpoint del API
- Retornar error 403 si no tiene permisos

---

## 🎨 Interfaz Sugerida por Rol

### **Administrador**
```
┌─────────────────────────────────────────┐
│  Dashboard | Clientes | Citas | Servicios │
│  Empleados | Ventas | Reportes | Config  │
└─────────────────────────────────────────┘
```

### **Barbero**
```
┌─────────────────────────────────────────┐
│  Mi Agenda | Mis Clientes | Mis Servicios │
│  Mi Rendimiento | Perfil                │
└─────────────────────────────────────────┘
```

### **Recepcionista**
```
┌─────────────────────────────────────────┐
│  Calendario | Clientes | Nueva Cita     │
│  Caja | Reportes del Día               │
└─────────────────────────────────────────┘
```

---

## 🔄 Flujo de Autenticación

```
1. Usuario abre la app de escritorio
2. Ingresa credenciales (username/password)
3. Backend valida y retorna:
   - Token JWT
   - Información del usuario
   - Rol asignado
   - Permisos
4. App carga interfaz según rol
5. Cada acción valida permisos antes de ejecutar
```

---

## 📱 Consideración: App para Clientes (Opcional)

Si decides crear una app/web para clientes:

**Tecnologías sugeridas:**
- **React Native** o **Flutter** (app móvil)
- **React** o **Vue** (web app)
- Mismo backend API
- Autenticación separada (registro/login de clientes)

**Funcionalidades para clientes:**
- Ver perfil personal
- Reservar citas disponibles
- Ver historial de servicios
- Cancelar/modificar sus citas
- Ver promociones
- Calificar servicios
- Notificaciones push

---

## ✅ Resumen

**App de Escritorio:**
- ✅ Administrador
- ✅ Barbero  
- ✅ Recepcionista
- ❌ Cliente (usa app móvil/web si se implementa)

**Ventajas de esta arquitectura:**
- Seguridad: Cada rol ve solo lo necesario
- Usabilidad: Interfaz simplificada según necesidades
- Escalabilidad: Fácil agregar nuevos roles
- Mantenibilidad: Código organizado por permisos

---

¿Te parece bien esta estructura de roles? ¿Quieres ajustar algún permiso o agregar otro rol?
