# Sistema de Gestión de Barbería

Sistema de escritorio para la gestión integral de una barbería con base de datos en línea.

## 📁 Archivos del Proyecto

### Diagramas UML

1. **`diagrama-uml.puml`** - Diagrama de clases completo en formato PlantUML
   - Para visualizar: Usa extensiones como "PlantUML" en VS Code o visita [PlantText](https://www.planttext.com/)
   - Contiene todas las clases, relaciones y módulos del sistema

2. **`diagrama-uml-mermaid.md`** - Diagramas en formato Mermaid
   - Incluye: Diagrama de clases, casos de uso y flujos de proceso
   - Para visualizar: Usa extensiones como "Markdown Preview Mermaid Support" en VS Code
   - También puedes usar: [Mermaid Live Editor](https://mermaid.live/)

### Documentación

3. **`ARQUITECTURA_Y_TECNOLOGIAS.md`** - Documentación completa de:
   - Arquitectura del sistema
   - Stack tecnológico recomendado
   - Comparación de opciones
   - Estructura de proyecto sugerida

4. **`ROLES_Y_PERMISOS.md`** - Documentación de:
   - Roles del sistema (Administrador, Barbero, Recepcionista)
   - Matriz de permisos detallada
   - Arquitectura de acceso por rol
   - Interfaz sugerida para cada rol

5. **`ACCESO_BARBEROS_CITAS.md`** - Soluciones para que barberos vean sus citas:
   - Opciones disponibles (App escritorio, Google Calendar, App móvil, etc.)
   - Recomendación híbrida
   - Implementación técnica detallada
   - Plan de implementación

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18+ instalado
- Cuenta de Supabase creada

### Pasos de Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
   - Copia `env.example.txt` a `.env`
   - Agrega tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anon
```

3. **Configurar base de datos:**
   - Ve a `SETUP.md` para ver el script SQL completo
   - Ejecuta el script en el SQL Editor de Supabase

4. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

### Documentación Completa
Para más detalles sobre la configuración, consulta **`SETUP.md`**

## 📊 Módulos Incluidos

- ✅ Gestión de Clientes
- ✅ Sistema de Citas/Reservas
- ✅ Gestión de Servicios
- ✅ Gestión de Empleados/Barberos
- ✅ Punto de Venta (POS)
- ✅ Reportes y Estadísticas
- ✅ Configuración del Sistema
- ❌ Inventario (excluido por ahora)

## 🛠️ Visualización de Diagramas

### PlantUML
```bash
# Instalar PlantUML (requiere Java)
# Opción 1: Extensión VS Code "PlantUML"
# Opción 2: Online en https://www.planttext.com/
```

### Mermaid
```bash
# Opción 1: Extensión VS Code "Markdown Preview Mermaid Support"
# Opción 2: Online en https://mermaid.live/
# Opción 3: GitHub renderiza Mermaid automáticamente
```

## 📝 Notas

- Los diagramas están diseñados para ser la base del desarrollo
- La base de datos será en línea (cloud) para acceso remoto
- El sistema está preparado para funcionar offline con sincronización

---

¿Listo para comenzar la implementación? 🎉
