import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useUiStore } from './uiStore'
import { RealtimeChannel } from '@supabase/supabase-js'

let realtimeSubscription: RealtimeChannel | null = null

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  email?: string
  fecha_registro: string
  visitas: number
  ultima_visita?: string
  notas?: string
  activo: boolean
}

interface ClientesState {
  clientes: Cliente[]
  loading: boolean
  searchTerm: string
  lastFetch?: number
  fetchClientes: () => Promise<void>
  addCliente: (cliente: Omit<Cliente, 'id' | 'visitas'>) => Promise<{ success: boolean; error?: string }>
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<{ success: boolean; error?: string }>
  deleteCliente: (id: string) =>Promise<{ success: boolean; error?: string }>
  setSearchTerm: (term: string) => void
  incrementVisitas: (id: string) => Promise<void>
  subscribeToRealtimeUpdates: () => void
  unsubscribeFromRealtimeUpdates: () => void
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],
  loading: false,
  searchTerm: '',
  lastFetch: undefined,

  fetchClientes: async () => {
    const state = get()
    const now = Date.now()

    if (state.lastFetch && now - state.lastFetch < 5 * 60 * 1000 && state.clientes.length > 0) {
      return
    }

    set({ loading: true })

    try {
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .order('fecha_registro', { ascending: false })

      if (clientesError) throw clientesError

      const { data: visitasData, error: visitasError } = await supabase
        .from('citas')
        .select('cliente_id, estado')
        .eq('estado', 'COMPLETADA')

      if (visitasError) throw visitasError

       const visitasPorCliente: Record<string, number> = {}
      const ultimaVisitaPorCliente: Record<string, string> = {}

      visitasData?.forEach(cita => {
        if (!visitasPorCliente[cita.cliente_id]) {
          visitasPorCliente[cita.cliente_id] = 0
        }
        visitasPorCliente[cita.cliente_id]++
      })

      const { data: ultimasVisitas, error: ultimasError } = await supabase
        .from('citas')
        .select('cliente_id, fecha_hora')
        .eq('estado', 'COMPLETADA')
        .order('fecha_hora', { ascending: false })

      if (!ultimasError && ultimasVisitas) {
        ultimasVisitas.forEach(cita => {
          if (!ultimaVisitaPorCliente[cita.cliente_id]) {
            const fecha = new Date(cita.fecha_hora).toISOString().split('T')[0]
            ultimaVisitaPorCliente[cita.cliente_id] = fecha
          }
        })
      }

      const clientesConVisitas = (clientesData || []).map(cliente => ({
        ...cliente,
        visitas: visitasPorCliente[cliente.id] || 0,
        ultima_visita: ultimaVisitaPorCliente[cliente.id] || cliente.ultima_visita
      }))

      set({ clientes: clientesConVisitas, loading: false, lastFetch: Date.now() })
    } catch (error) {
      console.error('Error fetching clientes:', error)
      set({ loading: false })
    }
  },

  addCliente: async (cliente) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Guardando cliente...')
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single()

      if (error) throw error

      set(state => ({ clientes: [{ ...data, visitas: 0, ultima_visita: undefined }, ...state.clientes] }))

      await get().fetchClientes()

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  updateCliente: async (id, cliente) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Actualizando cliente...')
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(cliente)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set(state => ({
        clientes: state.clientes.map(c => c.id === id ? { ...c, ...data } : c)
      }))

      await get().fetchClientes()

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  deleteCliente: async (id) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Eliminando cliente...')
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) throw error

      set(state => ({ clientes: state.clientes.filter(c => c.id !== id) }))

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  incrementVisitas: async (id) => {
    const cliente = get().clientes.find(c => c.id === id)
    if (cliente) {
      await get().updateCliente(id, {
        ultima_visita: new Date().toISOString().split('T')[0]
      })
    }
  },

  subscribeToRealtimeUpdates: () => {
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription)
    }

    realtimeSubscription = supabase
      .channel('clientes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clientes'
        },
        async () => {
          console.log('Cambio en clientes detectado, refrescando...')
          await get().fetchClientes()
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
