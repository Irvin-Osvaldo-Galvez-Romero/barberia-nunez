# Estructura de Vistas - Barbería App

## Documentación de Vistas y Componentes

Esta página documenta la estructura y organización de todas las vistas principales de la aplicación.

---

## 📋 Vistas Disponibles

### 1. **Clientes** (`Clientes.tsx` / `Clientes.css`)
**Gestión de clientes de la barbería**
- Listar todos los clientes registrados
- Crear nuevos clientes
- Editar información de clientes existentes
- Eliminar clientes
- Búsqueda y filtrado
- Estadísticas: Total de clientes, clientes activos, clientes nuevos

**Archivos:**
- `frontend/src/pages/Clientes.tsx` - Componente React
- `frontend/src/pages/Clientes.css` - Estilos (organizados por secciones)

**Secciones CSS:**
- Container Principal
- Header y Título
- Tarjetas de Estadísticas
- Buscador
- Tabla de clientes
- Formularios
- Dark Mode
- Responsive

---

### 2. **Servicios** (`Servicios.tsx` / `Servicios.css`)
**Gestión de servicios ofrecidos por la barbería**
- Listar servicios disponibles
- Crear nuevos servicios
- Editar servicios (nombre, descripción, precio, duración)
- Eliminar servicios
- Búsqueda y filtrado
- Estadísticas: Total de servicios, servicios activos, ingresos totales

**Archivos:**
- `frontend/src/pages/Servicios.tsx` - Componente React
- `frontend/src/pages/Servicios.css` - Estilos (organizados por secciones)

**Secciones CSS:**
- Container Principal
- Header y Título
- Tarjetas de Estadísticas
- Tabla de servicios
- Formularios
- Dark Mode
- Responsive

---

### 3. **Empleados** (`Empleados.tsx` / `Empleados.css`)
**Gestión de empleados (barberos) de la barbería**
- Listar empleados del sistema
- Crear nuevos empleados
- Editar información de empleados
- Eliminar empleados
- Asignación de roles (admin, barbero)
- Búsqueda y filtrado
- Estadísticas: Total de barberos, barberos activos, citas totales

**Archivos:**
- `frontend/src/pages/Empleados.tsx` - Componente React
- `frontend/src/pages/Empleados.css` - Estilos (organizados por secciones)

**Secciones CSS:**
- Container Principal
- Header y Título
- Tarjetas de Estadísticas
- Tabla de empleados
- Formularios
- Dark Mode
- Responsive

---

### 4. **Citas** (`Citas.tsx` / `Citas.css`)
**Gestión y visualización de citas/reservas**
- Calendario semanal interactivo
- Visualización de horarios disponibles
- Crear nuevas citas
- Editar citas existentes
- Cancelar citas
- Asignación de barbero y servicios
- Validación de conflictos de citas
- Búsqueda y filtrado de citas
- Mini calendario para navegación

**Archivos:**
- `frontend/src/pages/Citas.tsx` - Componente React
- `frontend/src/pages/Citas.css` - Estilos (organizados por secciones)

**Secciones CSS:**
- Container Principal
- Contenido Principal
- Header del Calendario
- Controles de Navegación
- Calendario semanal
- Slots de citas
- Mini calendario (sidebar)
- Modales
- Formularios
- Dark Mode
- Responsive

---

### 5. **Configuración** (`Configuracion.tsx` / `Configuracion.css`)
**Panel de administración del sistema**
- Configuración de horarios de trabajo (por día de la semana)
- Información del negocio (nombre, teléfono, email, dirección)
- Configuración general (moneda, formato de fecha, zona horaria, idioma)
- Configuración de notificaciones
- Sistema de tabs para organización

**Archivos:**
- `frontend/src/pages/Configuracion.tsx` - Componente React
- `frontend/src/pages/Configuracion.css` - Estilos (organizados por secciones)

**Secciones CSS:**
- Estilos Globales - Configuración
- Estilos de Formularios - Global
- Dark Mode - Estilos Globales
- Vista 1: Horarios de Trabajo
- Vista 2, 3, 4: Negocio / General / Notificaciones
- Botones y Acciones - Global
- Responsive - Todos los modos

---

## 🎨 Sistema de Temas

Todas las vistas soportan:
- **Modo Claro**: Tema profesional clásico con paleta neutral
- **Modo Oscuro**: Tema oscuro con colores contrastantes para mejor legibilidad

## 📱 Responsividad

Todas las vistas son completamente responsivas:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔒 Control de Acceso

El acceso a ciertas vistas está restringido por rol:
- **Admin**: Acceso completo a todas las vistas
- **Barbero**: Acceso limitado (solo a Citas y perfil personal)

---

## 📝 Convenciones de Código

### Estructura de Archivos CSS
Cada archivo CSS está organizado con comentarios claros:
```css
/* ========================================
   NOMBRE DE LA VISTA
   ======================================== */

/* Sección 1 */
.clase-estilo { }

/* Sección 2 */
.otra-clase { }

/* ========================================
   DARK MODE - Sección específica
   ======================================== */
html[data-theme="dark"] .clase { }
```

### Estructura de Archivos TypeScript
Cada componente incluye un comentario JSDoc:
```typescript
/**
 * VISTA: NOMBRE
 * Descripción breve
 * - Característica 1
 * - Característica 2
 */
```

---

## 🔗 Enlaces Relacionados

- [Layout principal](../components/Layout.tsx)
- [Stores de estado](../stores/)
- [Hooks personalizados](../hooks/)
- [Tipos globales](../types/)

---

**Última actualización:** 25 de enero de 2026
