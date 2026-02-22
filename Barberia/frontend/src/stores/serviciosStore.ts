import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useUiStore } from './uiStore'
import { RealtimeChannel } from '@supabase/supabase-js'

let realtimeSubscription: RealtimeChannel | null = null

export interface Servicio {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  duracion: number // en minutos
  categoria: string
  activo: boolean
}

interface ServiciosState {
  servicios: Servicio[]
  loading: boolean
  searchTerm: string
  categoriaFilter: string
  fetchServicios: () => Promise<void>
  addServicio: (servicio: Omit<Servicio, 'id'>) => Promise<{ success: boolean; error?: string }>
  updateServicio: (id: string, servicio: Partial<Servicio>) => Promise<{ success: boolean; error?: string }>
  deleteServicio: (id: string) => Promise<{ success: boolean; error?: string }>
  setSearchTerm: (term: string) => void
  setCategoriaFilter: (categoria: string) => void
  subscribeToRealtimeUpdates: () => void
  unsubscribeFromRealtimeUpdates: () => void
}

export const useServiciosStore = create<ServiciosState>((set, get) => ({
  servicios: [],
  loading: false,
  searchTerm: '',
  categoriaFilter: 'Todas',

  fetchServicios: async () => {
    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      set({ servicios: data || [], loading: false })
    } catch (error: any) {
      console.error('Error fetching servicios:', error)
      set({ loading: false })
    }
  },

  addServicio: async (servicio) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Guardando servicio...')
    try {
      const { data, error } = await supabase
        .from('servicios')
        .insert([servicio])
        .select()
        .single()

      if (error) throw error

      set(state => ({
        servicios: [...state.servicios, data].sort((a, b) => a.nombre.localeCompare(b.nombre))
      }))

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  updateServicio: async (id, servicio) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Actualizando servicio...')
    try {
      const { data, error } = await supabase
        .from('servicios')
        .update(servicio)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set(state => ({
        servicios: state.servicios.map(s => s.id === id ? { ...s, ...data } : s)
      }))

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  deleteServicio: async (id) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Eliminando servicio...')
    try {
      const { error } = await supabase
        .from('servicios')
        .delete()
        .eq('id', id)

      if (error) throw error
      set(state => ({ servicios: state.servicios.filter(s => s.id !== id) }))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),
  setCategoriaFilter: (categoria) => set({ categoriaFilter: categoria }),

  subscribeToRealtimeUpdates: () => {
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription)
    }

    realtimeSubscription = supabase
      .channel('servicios-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'servicios'
        },
        async () => {
          console.log('Cambio en servicios detectado, refrescando...')
          await get().fetchServicios()
        }
      )
      .subscribe()
  },

  unsubscribeFromRealtimeUpdates: () => {
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription)
      realtimeSubscription = null
    }
  },
}))
