# 📋 GUÍA DE PRUEBAS MANUALES - FRONTEND

## Verificar Todas las Funciones

### 1. AUTENTICACIÓN
- [ ] **Login exitoso**
  - Usa: admin@demo.com / demo123
  - Verifica que redirige a /dashboard
  - Verifica que el usuario aparece en la esquina superior derecha

- [ ] **Login fallido**
  - Intenta con credenciales incorrectas
  - Verifica que muestra mensaje de error

- [ ] **Registro de nueva cuenta**
  - Crea una cuenta con:
    - Email: testuser@demo.com
    - Password: TestPassword123
    - Nombre: Test User
  - Verifica que aparece en la lista de usuarios

- [ ] **Logout**
  - Haz click en el usuario en la esquina superior derecha
  - Haz click en "Cerrar Sesión"
  - Verifica que redirige a /login

### 2. DASHBOARD
- [ ] **Carga sin errores**
  - Ve a http://localhost:5173/dashboard
  - Verifica que carga en menos de 2 segundos
  - Verifica que no hay errores en la consola

- [ ] **Estadísticas visibles**
  - [ ] Total de clientes
  - [ ] Total de servicios
  - [ ] Total de empleados
  - [ ] Próximas citas

- [ ] **Gráficos y reportes**
  - [ ] Gráfico de citas por estado
  - [ ] Gráfico de ingresos

- [ ] **Modo oscuro**
  - Haz click en el toggle de tema
  - Verifica que todo se ve correctamente

### 3. CLIENTES
- [ ] **Listar clientes**
  - Ve a Clientes
  - Verifica que se cargan todos los clientes
  - Verifica que hay al menos 2-3 clientes

- [ ] **Crear cliente**
  - Haz click en "Nuevo Cliente"
  - Completa:
    - Nombre: Juan Pérez
    - Teléfono: 555-1234
    - Email: juan@test.com
  - Guarda
  - Verifica que aparece en la lista

- [ ] **Búsqueda**
  - Escribe "juan" en la búsqueda
  - Verifica que filtra en tiempo real
  - Verifica que es rápido (sin lag)

- [ ] **Editar cliente**
  - Haz click en un cliente
  - Cambia el teléfono
  - Guarda
  - Verifica que se actualizó

- [ ] **Eliminar cliente**
  - Intenta eliminar un cliente
  - Verifica que pide confirmación
  - Verifica que se elimina

### 4. SERVICIOS
- [ ] **Listar servicios**
  - Ve a Servicios
  - Verifica que se cargan todos
  - Verifica que muestra: nombre, precio, duración

- [ ] **Crear servicio**
  - Haz click en "Nuevo Servicio"
  - Completa:
    - Nombre: Corte Clásico
    - Precio: 200
    - Duración: 30 min
  - Guarda
  - Verifica que aparece

- [ ] **Editar servicio**
  - Cambia el precio
  - Verifica que se actualiza

- [ ] **Cambiar estado**
  - Marca/desmarca "Servicio activo"
  - Verifica el checkbox en modo oscuro

### 5. EMPLEADOS
- [ ] **Listar empleados**
  - Ve a Empleados
  - Verifica que muestra: nombre, rol, teléfono

- [ ] **Crear empleado**
  - Haz click en "Nuevo Empleado"
  - Completa:
    - Nombre: Carlos López
    - Email: carlos@barberia.com
    - Rol: BARBERO
    - Teléfono: 555-5678
  - Guarda
  - Verifica que aparece

- [ ] **Conectar Google Calendar**
  - Haz click en un empleado
  - Verifica el botón de "Conectar Google Calendar"
  - Si está conectado, debe mostrar "Desconectar"

### 6. CITAS (La más importante)
- [ ] **Calendario se carga**
  - Ve a Citas
  - Verifica que ve el calendario semanal
  - Verifica que se ven los barberos

- [ ] **Crear cita**
  - Haz click en un horario vacío
  - Completa:
    - Cliente: Juan Pérez
    - Barbero: Cualquiera
    - Servicio: Corte Clásico
    - Hora: 10:00
  - Guarda
  - Verifica que aparece en el calendario

- [ ] **Cita aparece en Google Calendar**
  - Espera 5-10 segundos
  - Abre Google Calendar del barbero
  - Verifica que la cita aparece automáticamente
  - **ESTO CONFIRMA QUE EL SYNC AUTOMÁTICO FUNCIONA** ✅

- [ ] **Editar cita**
  - Haz click en una cita
  - Cambia el estado a "CONFIRMADA"
  - Guarda
  - Verifica que se actualiza

- [ ] **Cambiar de semana**
  - Haz click en flechas de navegación
  - Verifica que carga rápido (caché funciona)

- [ ] **Filtrar por barbero**
  - Usa el dropdown de barbero
  - Verifica que filtra correctamente

### 7. CONFIGURACIÓN
- [ ] **Información del negocio**
  - Ve a Configuración
  - Ve a "Información del Negocio"
  - Verifica que carga la información
  - Cambia algo
  - Guarda
  - Verifica que se guarda

- [ ] **Horarios**
  - Sección "Horarios"
  - Verifica que muestra los 7 días
  - Cambia un horario
  - Guarda
  - Verifica que se actualiza

- [ ] **Notificaciones**
  - Sección "Notificaciones"
  - Verifica que muestra opciones
  - Cambia algo
  - Guarda

### 8. RENDIMIENTO (OPTIMIZACIONES)
- [ ] **Carga inicial**
  - Abre DevTools (F12)
  - Ve a Lighthouse
  - Haz un "Analyze page load"
  - **Esperado:**
    - FCP < 2s
    - LCP < 3s
    - CLS < 0.1

- [ ] **Cambio de semana (caché)**
  - Ve a Citas
  - Abre Network en DevTools
  - Haz click en flecha siguiente
  - Verifica que NO hace queries a la BD (caché funciona)

- [ ] **Búsqueda de clientes (debounce)**
  - Ve a Clientes
  - Abre Network en DevTools
  - Escribe "test"
  - Verifica que solo hace 1 query, no 4

- [ ] **Modo oscuro sin lag**
  - Haz click en el toggle de tema
  - Verifica que no hay parpadeo
  - Verifica que los colores son correctos

### 9. SINCRONIZACIÓN GOOGLE CALENDAR
- [ ] **Sync automático en nuevas citas**
  - Crea una cita
  - Abre los logs del backend (terminal)
  - Verifica que ve:
    ```
    🔍 Buscando citas entre...
    📋 Procesando X citas...
    ✅ Evento creado: [event_id]
    ```
  - Abre Google Calendar del barbero
  - Verifica que la cita aparece en 5-10 segundos

- [ ] **Sync omite duplicados**
  - Crea una cita
  - Espera a que se sincronice
  - Abre la terminal del backend
  - Copia el nombre del barbero
  - Llama `/api/google/sync` nuevamente
  - Verifica en los logs que dice:
    ```
    ⏭️  Cita X ya sincronizada, saltando...
    ```

- [ ] **Manejo de errores de token**
  - Revoca el acceso de Google Calendar del barbero
  - Crea una cita
  - Verifica en los logs que maneja el error gracefully

### 10. BASE DE DATOS (INTEGRIDAD)
- [ ] **Datos persistentes**
  - Crea un cliente
  - Recarga la página
  - Verifica que el cliente sigue ahí

- [ ] **Relaciones correctas**
  - Crea una cita con cliente y barbero
  - Abre DevTools → Network → XHR
  - Busca la query de citas
  - Verifica que incluye datos del cliente y barbero

- [ ] **Eliminación en cascada**
  - Ve a Clientes
  - Intenta eliminar un cliente con citas
  - Verifica que no hay error de integridad

### 11. MODO DEMO vs REAL
- [ ] **Modo Demo detectado**
  - Con variables de .env vacías
  - Verifica que muestra aviso de "Modo Demo"
  - Los datos se guardan en localStorage

- [ ] **Modo Real detectado**
  - Con variables de .env configuradas
  - Verifica que NO muestra aviso de modo demo
  - Los datos vienen de Supabase

### 12. RESPONSIVIDAD
- [ ] **Desktop (1920x1080)**
  - Verifica que todo se ve bien

- [ ] **Tablet (768x1024)**
  - F12 → Toggle device toolbar
  - Selecciona iPad
  - Verifica que es usable

- [ ] **Mobile (375x667)**
  - Selecciona iPhone
  - Verifica que es usable

## 📊 CHECKLIST DE CONFIRMACIÓN

```
AUTENTICACIÓN
□ Login funciona
□ Logout funciona
□ Registro funciona
□ Permisos por rol funcionan

DATOS
□ Clientes CRUD funciona
□ Servicios CRUD funciona
□ Empleados CRUD funciona
□ Citas CRUD funciona

GOOGLE CALENDAR
□ Sync automático funciona
□ Evita duplicados
□ Maneja errores

RENDIMIENTO
□ Carga < 2s
□ Caché funciona
□ Búsqueda rápida
□ Modo oscuro sin lag

INTEGRIDAD
□ Datos persisten
□ Relaciones correctas
□ Base de datos íntegra
```

## 🔧 TROUBLESHOOTING

Si algo no funciona:

1. **Abre la consola (F12)**
   - Ve a pestaña Console
   - Busca errores en rojo

2. **Verifica el backend**
   - Terminal backend debe mostrar: "🚀 Backend ejecutándose"
   - Si no: `npm run dev` en carpeta backend/

3. **Verifica Supabase**
   - Ve a https://supabase.com
   - Verifica que la BD está accesible
   - Verifica que las tablas existen

4. **Limpia cache del navegador**
   - Ctrl+Shift+Delete
   - Selecciona "Cached images and files"
   - Recarga la página
