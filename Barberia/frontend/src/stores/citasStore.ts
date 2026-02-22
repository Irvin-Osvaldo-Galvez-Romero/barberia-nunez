import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useUiStore } from './uiStore'
import { RealtimeChannel } from '@supabase/supabase-js'

// Importación estática para evitar dependencias circulares
let clientesStore: any = null

// Variable para guardar la suscripción realtime
let realtimeSubscription: RealtimeChannel | null = null

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO'

export interface ServicioCita {
  servicio_id: string
  servicio_nombre: string
  precio: number
}

export interface Cita {
  id: string
  cliente_id: string
  cliente_nombre: string
  cliente_telefono?: string
  barbero_id: string
  barbero_nombre: string
  fecha_hora: string // ISO string
  duracion: number // en minutos
  estado: EstadoCita
  notas?: string
  servicios: ServicioCita[]
  fecha_creacion: string
}

interface CitasState {
  citas: Cita[]
  loading: boolean
  currentDate: Date
  selectedDate: Date
  lastFetchStart?: Date
  lastFetchEnd?: Date
  fetchCitas: (startDate?: Date, endDate?: Date) => Promise<void>
  addCita: (cita: Omit<Cita, 'id' | 'fecha_creacion'>, startDate?: Date, endDate?: Date) => Promise<{ success: boolean; error?: string }>
  updateCita: (id: string, cita: Partial<Cita>, startDate?: Date, endDate?: Date) => Promise<{ success: boolean; error?: string }>
  deleteCita: (id: string, startDate?: Date, endDate?: Date) => Promise<{ success: boolean; error?: string }>
  setCurrentDate: (date: Date) => void
  setSelectedDate: (date: Date) => void
  incrementClientVisits: (clienteId: string) => Promise<void>
  subscribeToRealtimeUpdates: () => void
  unsubscribeFromRealtimeUpdates: () => void
}

export const useCitasStore = create<CitasState>((set, get) => ({
  citas: [],
  loading: false,
  currentDate: new Date(),
  selectedDate: new Date(),
  lastFetchStart: undefined,
  lastFetchEnd: undefined,

  fetchCitas: async (startDate?: Date, endDate?: Date) => {
    const start = startDate || new Date()
    const end = endDate || new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    // Validar si ya tenemos datos recientes en caché
    const state = get()
    const cacheValido = state.lastFetchStart && state.lastFetchEnd &&
      start.getTime() === state.lastFetchStart.getTime() &&
      end.getTime() === state.lastFetchEnd.getTime()
    
    if (cacheValido && state.citas.length > 0) {
      return // Usar datos del caché
    }
    
    set({ loading: true })

    try {
      // Usar formato local literal para consultas
      const formatDateLocal = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      
      const startStr = formatDateLocal(start)
      const endStr = formatDateLocal(end)
      
      const { data, error } = await supabase
        .from('citas')
        .select(`
          *,
          clientes:cliente_id(nombre, telefono),
          empleados:barbero_id(nombre),
          servicios_citas(
            servicio_id,
            precio,
            servicios:servicio_id(id, nombre, precio)
          )
        `, { count: 'exact' })
        .gte('fecha_hora', startStr)
        .lte('fecha_hora', endStr)
        .order('fecha_hora', { ascending: true })

      if (error) throw error

      const citasFormatted: Cita[] = (data || []).map((cita: any) => ({
        id: cita.id,
        cliente_id: cita.cliente_id,
        cliente_nombre: cita.clientes?.nombre || '',
        cliente_telefono: cita.clientes?.telefono,
        barbero_id: cita.barbero_id,
        barbero_nombre: cita.empleados?.nombre || '',
        fecha_hora: cita.fecha_hora,
        duracion: cita.duracion,
        estado: cita.estado,
        notas: cita.notas,
        servicios: cita.servicios_citas?.map((sc: any) => ({
          servicio_id: sc.servicio_id || sc.servicios?.id,
          servicio_nombre: sc.servicios?.nombre || '',
          precio: sc.precio || sc.servicios?.precio || 0
        })) || [],
        fecha_creacion: cita.fecha_creacion
      }))

      set({ citas: citasFormatted, loading: false, lastFetchStart: start, lastFetchEnd: end })
    } catch (error: any) {
      console.error('Error fetching citas:', error)
      set({ loading: false })
    }
  },

  addCita: async (cita, startDate?: Date, endDate?: Date) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Guardando cita...')
    try {
      const { data: citaData, error: citaError } = await supabase
        .from('citas')
        .insert([{
          cliente_id: cita.cliente_id,
          barbero_id: cita.barbero_id,
          fecha_hora: cita.fecha_hora,
          duracion: cita.duracion,
          estado: cita.estado,
          notas: cita.notas
        }])
        .select()
        .single()

      if (citaError) throw citaError

      // Insertar servicios de la cita
      if (cita.servicios && cita.servicios.length > 0) {
        // Filtrar y validar servicios antes de insertar
        const serviciosCitas = cita.servicios
          .filter(serv => serv.servicio_id && serv.servicio_id.trim() !== '') // Validar que servicio_id no sea null, undefined o vacío
          .map(serv => ({
            cita_id: citaData.id,
            servicio_id: serv.servicio_id,
            precio: serv.precio || 0 // Asegurar que precio tenga un valor por defecto
          }))

        // Solo insertar si hay servicios válidos
        if (serviciosCitas.length > 0) {
          const { error: serviciosError } = await supabase
            .from('servicios_citas')
            .insert(serviciosCitas)

          if (serviciosError) throw serviciosError
        } else {
          throw new Error('No se proporcionaron servicios válidos para la cita')
        }
      }

      // Incrementar visitas del cliente
      await get().incrementClientVisits(cita.cliente_id)

      // Refrescar citas con las mismas fechas que se estaban mostrando
      const state = get()
      await get().fetchCitas(startDate || state.lastFetchStart, endDate || state.lastFetchEnd)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  updateCita: async (id, cita, startDate?, endDate?) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Actualizando cita...')
    try {
      // Filtrar solo los campos que existen en la tabla citas
      // Excluir campos calculados como barbero_nombre, cliente_nombre, cliente_telefono, servicios
      const { 
        barbero_nombre, 
        cliente_nombre, 
        cliente_telefono, 
        servicios,
        fecha_creacion,
        ...camposActualizables 
      } = cita as any

      // Preparar datos para actualizar servicios si se proporcionaron
      let serviciosCitas: any[] | null = null
      if (servicios && Array.isArray(servicios)) {
        serviciosCitas = servicios
      }

      // Actualizar la cita principal
      const { error: updateError } = await supabase
        .from('citas')
        .update(camposActualizables)
        .eq('id', id)

      if (updateError) throw updateError

      // Si se proporcionaron servicios, actualizarlos
      if (serviciosCitas && serviciosCitas.length > 0) {
        // Eliminar servicios existentes
        const { error: deleteError } = await supabase
          .from('servicios_citas')
          .delete()
          .eq('cita_id', id)

        if (deleteError) throw deleteError

        // Filtrar y validar servicios antes de insertar
        const serviciosToInsert = serviciosCitas
          .filter(serv => serv.servicio_id && serv.servicio_id.trim() !== '') // Validar que servicio_id no sea null, undefined o vacío
          .map(serv => ({
            cita_id: id,
            servicio_id: serv.servicio_id,
            precio: serv.precio || 0 // Asegurar que precio tenga un valor por defecto
          }))

        // Solo insertar si hay servicios válidos
        if (serviciosToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('servicios_citas')
            .insert(serviciosToInsert)

          if (insertError) throw insertError
        }
      }

      // Refrescar citas con las mismas fechas que se estaban mostrando
      const state = get()
      await get().fetchCitas(startDate || state.lastFetchStart, endDate || state.lastFetchEnd)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  deleteCita: async (id, startDate?, endDate?) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Eliminando cita...')
    try {
      const { error } = await supabase
        .from('citas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Refrescar citas con las mismas fechas que se estaban mostrando
      const state = get()
      await get().fetchCitas(startDate || state.lastFetchStart, endDate || state.lastFetchEnd)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  subscribeToRealtimeUpdates: () => {
    // Desuscribirse de suscripción anterior si existe
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription)
    }

    // Crear nueva suscripción a cambios en tiempo real
    realtimeSubscription = supabase
      .channel('citas-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'citas'
        },
        async (payload) => {
          console.log('Cambio en citas detectado:', payload)
          // Refrescar las citas con las mismas fechas que se estaban mostrando
          const state = get()
          if (state.lastFetchStart && state.lastFetchEnd) {
            await get().fetchCitas(state.lastFetchStart, state.lastFetchEnd)
          }
        }
      )
      .subscribe((status) => {
        console.log('Estado de suscripción realtime:', status)
      })
  },

  unsubscribeFromRealtimeUpdates: () => {
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription)
      realtimeSubscription = null
      console.log('Desuscrito de actualizaciones en tiempo real de citas')
    }
  },

  incrementClientVisits: async (clienteId) => {
    // Importar dinámicamente para evitar dependencias circulares
    if (!clientesStore) {
      const { useClientesStore } = await import('./clientesStore')
      clientesStore = useClientesStore
    }
    const { incrementVisitas } = clientesStore.getState()
    await incrementVisitas(clienteId)
  }
}))