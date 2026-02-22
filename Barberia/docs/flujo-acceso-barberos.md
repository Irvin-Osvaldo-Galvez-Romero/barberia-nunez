# Flujo de Acceso de Barberos a sus Citas

## Diagrama de Flujo - Solución Híbrida Recomendada

```mermaid
flowchart TD
    Start([Barbero necesita ver sus citas]) --> Opcion1{¿Dónde está?}
    
    Opcion1 -->|En la barbería| AppEscritorio[App de Escritorio]
    Opcion1 -->|En casa/calle| GoogleCalendar[Google Calendar]
    Opcion1 -->|Cualquier lugar| Notificacion[Notificación WhatsApp/Email]
    
    AppEscritorio --> Dashboard[Dashboard Personal]
    Dashboard --> VerCitas[Ver citas del día/semana]
    VerCitas --> DetallesCliente[Ver detalles del cliente]
    VerCitas --> MarcarCompletada[Marcar cita como completada]
    
    GoogleCalendar --> Sincronizacion[Sincronización automática]
    Sincronizacion --> VerEnCalendario[Ver en calendario personal]
    VerEnCalendario --> NotificacionesNativas[Notificaciones nativas de Google]
    
    Notificacion --> NuevaCita{Nueva cita asignada?}
    NuevaCita -->|Sí| RecibirMensaje[Recibir mensaje WhatsApp/Email]
    NuevaCita -->|Recordatorio| Recordatorio24h[Recordatorio 24h antes]
    NuevaCita -->|Recordatorio| Recordatorio1h[Recordatorio 1h antes]
    
    RecibirMensaje --> VerDetalles[Ver detalles en mensaje]
    Recordatorio24h --> Prepararse[Prepararse para la cita]
    Recordatorio1h --> ConfirmarAsistencia[Confirmar asistencia]
    
    MarcarCompletada --> ActualizarSistema[Actualizar en sistema]
    ActualizarSistema --> SincronizarGoogle[Sincronizar con Google Calendar]
    SincronizarGoogle --> ActualizarEstado[Estado: Completada]
    
    style AppEscritorio fill:#4CAF50
    style GoogleCalendar fill:#4285F4
    style Notificacion fill:#25D366
    style Dashboard fill:#81C784
```

## Arquitectura de Sincronización

```mermaid
sequenceDiagram
    participant R as Recepcionista
    participant S as Sistema/Backend
    participant DB as Supabase DB
    participant GC as Google Calendar API
    participant B as Barbero
    participant W as WhatsApp/Email
    
    R->>S: Crear nueva cita
    S->>DB: Guardar cita en BD
    S->>GC: Sincronizar con Google Calendar
    GC-->>B: Cita aparece en calendario
    S->>W: Enviar notificación
    W-->>B: Mensaje recibido
    
    Note over B: Barbero puede ver cita en:<br/>1. App Escritorio<br/>2. Google Calendar<br/>3. Notificación recibida
    
    B->>S: Iniciar sesión en app
    S->>DB: Consultar citas del barbero
    DB-->>S: Retornar citas
    S-->>B: Mostrar dashboard con citas
    
    B->>S: Marcar cita como completada
    S->>DB: Actualizar estado
    S->>GC: Actualizar evento en Google
    GC-->>B: Evento actualizado
```

## Comparación Visual de Opciones

```mermaid
graph LR
    subgraph "Opción 1: App Escritorio"
        A1[Dashboard] --> A2[Vista Tiempo Real]
        A2 --> A3[Marcar Completadas]
    end
    
    subgraph "Opción 2: Google Calendar"
        B1[OAuth] --> B2[Sincronización]
        B2 --> B3[Acceso Multi-dispositivo]
    end
    
    subgraph "Opción 3: Notificaciones"
        C1[WhatsApp] --> C2[Email]
        C2 --> C3[Recordatorios]
    end
    
    A1 -.Recomendado.-> Solucion[✅ Solución Híbrida]
    B1 -.Recomendado.-> Solucion
    C1 -.Recomendado.-> Solucion
    
    style Solucion fill:#4CAF50,stroke:#2E7D32,stroke-width:3px
    style A1 fill:#81C784
    style B1 fill:#64B5F6
    style C1 fill:#66BB6A
```

## Flujo de Sincronización con Google Calendar

```mermaid
flowchart LR
    Start([Nueva/Modificada Cita]) --> Validar{Barbero tiene<br/>Google conectado?}
    
    Validar -->|Sí| ObtenerToken[Obtener Refresh Token]
    Validar -->|No| Fin1([Fin - Sin sincronización])
    
    ObtenerToken --> CrearEvento[Crear/Actualizar Evento]
    CrearEvento --> ConfigurarReminders[Configurar Recordatorios]
    ConfigurarReminders --> EnviarAPI[Enviar a Google Calendar API]
    
    EnviarAPI --> Exito{¿Éxito?}
    Exito -->|Sí| GuardarEventoId[Guardar Google Event ID]
    Exito -->|No| LogError[Registrar Error]
    
    GuardarEventoId --> Fin2([Cita Sincronizada])
    LogError --> Fin1
    
    style Start fill:#4CAF50
    style Fin2 fill:#4CAF50
    style Fin1 fill:#FF9800
    style Exito fill:#2196F3
```

## Ventajas de la Solución Híbrida

```mermaid
mindmap
  root((Solución Híbrida))
    App Escritorio
      Vista completa
      Tiempo real
      Marcar completadas
      Ver detalles clientes
    Google Calendar
      Acceso móvil
      Notificaciones nativas
      Sincronización automática
      Multi-dispositivo
    Notificaciones
      WhatsApp
      Email
      Recordatorios automáticos
      Sin app adicional
```
