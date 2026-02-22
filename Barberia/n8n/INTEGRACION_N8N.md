# 🔌 Integración de n8n con tu Sistema Actual

Esta guía muestra cómo conectar tu frontend/backend con los flujos de n8n.

---

## 📋 Tabla de Contenidos

1. [Usar Webhooks desde el Frontend](#usar-webhooks-desde-el-frontend)
2. [Usar Webhooks desde el Backend](#usar-webhooks-desde-el-backend)
3. [Integrar con Zustand Stores](#integrar-con-zustand-stores)
4. [Manejo de Errores](#manejo-de-errores)
5. [Ejemplos Completos](#ejemplos-completos)

---

## 1. Usar Webhooks desde el Frontend

### Configuración inicial:

**frontend/.env**
```env
VITE_N8N_WEBHOOK_URL=https://tu-n8n.com/webhook
VITE_N8N_API_KEY=tu_api_key_opcional
```

### Crear servicio de n8n:

**frontend/src/services/n8nService.ts**
```typescript
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';

export const n8nService = {
  // Crear cita con sync a Google Calendar
  async crearCita(data: {
    cliente_id: string;
    barbero_id: string;
    fecha_hora: string;
    duracion: number;
    servicios: string[];
    notas?: string;
  }) {
    const response = await fetch(`${N8N_WEBHOOK_URL}/cita/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-API-Key': 'tu_api_key' // Si configuraste seguridad
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Error creando cita en n8n');
    }

    return response.json();
  },

  // Actualizar cita
  async actualizarCita(id: string, data: Partial<{
    cliente_id: string;
    barbero_id: string;
    fecha_hora: string;
    duracion: number;
    estado: string;
    notas: string;
  }>) {
    const response = await fetch(`${N8N_WEBHOOK_URL}/cita/actualizar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });

    if (!response.ok) {
      throw new Error('Error actualizando cita en n8n');
    }

    return response.json();
  },

  // Eliminar cita
  async eliminarCita(id: string) {
    const response = await fetch(`${N8N_WEBHOOK_URL}/cita/eliminar/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Error eliminando cita en n8n');
    }

    return response.json();
  },

  // Crear empleado
  async crearEmpleado(data: {
    nombre: string;
    telefono: string;
    email: string;
    rol: string;
    password_hash: string;
    porcentaje_comision?: number;
    especialidad?: string;
  }) {
    const response = await fetch(`${N8N_WEBHOOK_URL}/empleado/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Error creando empleado en n8n');
    }

    return response.json();
  },

  // Crear cliente
  async crearCliente(data: {
    nombre: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    notas?: string;
  }) {
    const response = await fetch(`${N8N_WEBHOOK_URL}/cliente/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Error creando cliente en n8n');
    }

    return response.json();
  },

  // Crear servicio
  async crearServicio(data: {
    nombre: string;
    descripcion?: string;
    precio: number;
    duracion: number;
    categoria?: string;
  }) {
    const response = await fetch(`${N8N_WEBHOOK_URL}/servicio/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Error creando servicio en n8n');
    }

    return response.json();
  }
};
```

---

## 2. Usar Webhooks desde el Backend

### Configuración:

**backend/.env**
```env
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook
N8N_API_KEY=tu_api_key_opcional
```

### Crear servicio:

**backend/src/services/n8nService.ts**
```typescript
import 'dotenv/config';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
const N8N_API_KEY = process.env.N8N_API_KEY;

export const n8nService = {
  async crearCita(data: any) {
    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/cita/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(N8N_API_KEY && { 'X-API-Key': N8N_API_KEY })
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`n8n webhook error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling n8n webhook:', error);
      throw error;
    }
  }
};
```

---

## 3. Integrar con Zustand Stores

### Opción A: Usar n8n en paralelo con Supabase

**frontend/src/stores/citasStore.ts**
```typescript
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { n8nService } from '../services/n8nService';
import { useUIStore } from './uiStore';

export const useCitasStore = create((set, get) => ({
  citas: [],
  
  // OPCIÓN A: Crear en Supabase primero, luego n8n para Google Calendar
  createCita: async (citaData) => {
    const { showBlockingLoader, hideBlockingLoader } = useUIStore.getState();
    
    try {
      showBlockingLoader('Creando cita...');

      // 1. Crear en Supabase (como siempre)
      const { data, error } = await supabase
        .from('citas')
        .insert(citaData)
        .select()
        .single();

      if (error) throw error;

      // 2. Sincronizar con Google Calendar vía n8n (en segundo plano)
      n8nService.crearCita({
        ...data,
        servicios: citaData.servicios
      }).catch(err => {
        console.warn('Google Calendar sync failed:', err);
        // No bloquea la operación principal
      });

      // 3. Actualizar store local
      set({ citas: [...get().citas, data] });

      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      hideBlockingLoader();
    }
  }
}));
```

### Opción B: Usar n8n como único endpoint (n8n → Supabase)

**frontend/src/stores/citasStore.ts**
```typescript
export const useCitasStore = create((set, get) => ({
  citas: [],
  
  // OPCIÓN B: n8n maneja todo (Supabase + Google Calendar)
  createCita: async (citaData) => {
    const { showBlockingLoader, hideBlockingLoader } = useUIStore.getState();
    
    try {
      showBlockingLoader('Creando cita...');

      // n8n hace: insertar en Supabase + crear en Google Calendar
      const result = await n8nService.crearCita({
        cliente_id: citaData.cliente_id,
        barbero_id: citaData.barbero_id,
        fecha_hora: citaData.fecha_hora,
        duracion: citaData.duracion,
        servicios: citaData.servicios,
        notas: citaData.notas
      });

      // El Realtime de Supabase actualizará automáticamente el store
      // O puedes hacerlo manual:
      set({ citas: [...get().citas, result.cita] });

      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      hideBlockingLoader();
    }
  },

  updateCita: async (id, updates) => {
    // Similar, usa n8n webhook
    await n8nService.actualizarCita(id, updates);
    // Realtime actualiza automáticamente
  },

  deleteCita: async (id) => {
    await n8nService.eliminarCita(id);
    // Realtime actualiza automáticamente
  }
}));
```

---

## 4. Manejo de Errores

### Con reintentos y timeouts:

**frontend/src/services/n8nService.ts**
```typescript
async function callN8NWebhook(
  endpoint: string, 
  options: RequestInit,
  retries = 3
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(endpoint, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`n8n call attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        throw new Error('n8n webhook no disponible. Operación guardada localmente.');
      }

      // Esperar antes de reintentar (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

export const n8nService = {
  async crearCita(data: any) {
    return callN8NWebhook(`${N8N_WEBHOOK_URL}/cita/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
};
```

---

## 5. Ejemplos Completos

### Ejemplo 1: Crear cita desde el frontend

**frontend/src/pages/Citas.tsx**
```typescript
import { useCitasStore } from '../stores/citasStore';

function Citas() {
  const { createCita } = useCitasStore();

  const handleSubmit = async (formData: any) => {
    try {
      const result = await createCita({
        cliente_id: formData.clienteId,
        barbero_id: formData.barberoId,
        fecha_hora: formData.fechaHora,
        duracion: formData.duracion,
        servicios: formData.serviciosIds,
        notas: formData.notas
      });

      console.log('Cita creada:', result);
      // result.cita → datos de Supabase
      // result.google_event_id → ID del evento en Google Calendar

      toast.success('¡Cita creada y sincronizada con Google Calendar!');
    } catch (error) {
      toast.error('Error al crear la cita');
      console.error(error);
    }
  };

  // ... resto del componente
}
```

---

### Ejemplo 2: Webhook con autenticación

**backend/src/routes/citas.ts**
```typescript
import express from 'express';
import { n8nService } from '../services/n8nService';

const router = express.Router();

router.post('/citas', async (req, res) => {
  try {
    const citaData = req.body;

    // Validación
    if (!citaData.cliente_id || !citaData.barbero_id) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Llamar a n8n (que insertará en Supabase y Google Calendar)
    const result = await n8nService.crearCita(citaData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Error creando cita',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
```

---

### Ejemplo 3: Fallback si n8n no está disponible

**frontend/src/services/citasService.ts**
```typescript
import { supabase } from '../lib/supabase';
import { n8nService } from './n8nService';

export const citasService = {
  async crearCita(data: any) {
    try {
      // Intentar usar n8n (incluye Google Calendar)
      return await n8nService.crearCita(data);
    } catch (n8nError) {
      console.warn('n8n no disponible, usando Supabase directo:', n8nError);

      // Fallback: insertar solo en Supabase
      const { data: cita, error } = await supabase
        .from('citas')
        .insert({
          cliente_id: data.cliente_id,
          barbero_id: data.barbero_id,
          fecha_hora: data.fecha_hora,
          duracion: data.duracion,
          notas: data.notas
        })
        .select()
        .single();

      if (error) throw error;

      // Insertar servicios
      if (data.servicios?.length) {
        await supabase
          .from('servicios_citas')
          .insert(
            data.servicios.map((servicio_id: string) => ({
              cita_id: cita.id,
              servicio_id
            }))
          );
      }

      return {
        cita,
        google_sync: false, // Indica que no se sincronizó con Google
        warning: 'Google Calendar no disponible'
      };
    }
  }
};
```

---

## 🔄 Estrategias de Integración

### Estrategia 1: n8n como capa adicional (Recomendado)

```
Frontend → Supabase (insert) → n8n (webhook) → Google Calendar
         ↓
    Realtime updates
```

**Ventajas:**
- ✅ Frontend sigue funcionando si n8n falla
- ✅ Google Calendar es "nice to have", no crítico
- ✅ Más fácil de debuggear

---

### Estrategia 2: n8n como proxy único

```
Frontend → n8n (webhook) → Supabase + Google Calendar
         ↓
    Realtime updates
```

**Ventajas:**
- ✅ Una sola llamada desde frontend
- ✅ n8n centraliza toda la lógica
- ✅ Más fácil agregar otras integraciones

**Desventajas:**
- ❌ Si n8n falla, todo falla
- ❌ Más dependencias

---

### Estrategia 3: Híbrida (Mejor de ambos mundos)

```
Frontend → Supabase (insert)
         ↓
    Trigger Supabase → n8n (webhook) → Google Calendar
         ↓
    Realtime updates
```

**Ventajas:**
- ✅ Frontend totalmente desacoplado
- ✅ n8n reacciona a cambios en BD
- ✅ Fácil de escalar

⚠️ Requiere configurar **Database Webhooks** en Supabase

---

## 🎯 Recomendación Final

Para tu caso, recomiendo **Estrategia 1**:

1. **Mantén tu código actual** (Supabase directo)
2. **Agrega llamadas a n8n** solo para Google Calendar sync
3. **Usa `try/catch`** para que fallas de n8n no bloqueen operaciones

Así tienes:
- ✅ Sistema principal robusto
- ✅ Google Calendar como feature extra
- ✅ Recordatorios y reportes automáticos
- ✅ Fácil rollback si hay problemas

---

¿Necesitas ayuda implementando alguna de estas estrategias? 🚀
