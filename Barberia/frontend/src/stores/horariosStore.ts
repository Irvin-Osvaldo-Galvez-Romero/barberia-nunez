import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useUiStore } from './uiStore'
import { RealtimeChannel } from '@supabase/supabase-js'

let realtimeSubscription: RealtimeChannel | null = null

export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO'

export interface Horario {
  id: string
  dia_semana: DiaSemana
  hora_apertura: string
  hora_cierre: string
  activo: boolean
}

interface HorariosState {
  horarios: Horario[]
  loading: boolean
  fetchHorarios: () => Promise<void>
  updateHorario: (dia: DiaSemana, horario: Partial<Horario>) => Promise<{ success: boolean; error?: string }>
  saveHorarios: (horarios: Horario[]) => Promise<{ success: boolean; error?: string }>
  subscribeToRealtimeUpdates: () => void
  unsubscribeFromRealtimeUpdates: () => void
}

export const useHorariosStore = create<HorariosState>((set, get) => ({
  horarios: [],
  loading: false,

  fetchHorarios: async () => {
    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('horarios_negocio')
        .select('*')
        .order('dia_semana', { ascending: true })

      if (error) throw error

      const formattedData = (data || []).map(horario => ({
        ...horario,
        hora_apertura: horario.hora_apertura ? horario.hora_apertura.substring(0, 5) : '09:00',
        hora_cierre: horario.hora_cierre ? horario.hora_cierre.substring(0, 5) : '18:00'
      }))

      set({ horarios: formattedData, loading: false })
    } catch (error: any) {
      console.error('Error fetching horarios:', error)
      set({ horarios: [], loading: false })
    }
  },

  updateHorario: async (dia, horario) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Guardando horario...')
    try {
      const existingHorario = get().horarios.find(h => h.dia_semana === dia)

      if (existingHorario) {
        const { error } = await supabase
          .from('horarios_negocio')
          .update(horario)
          .eq('dia_semana', dia)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('horarios_negocio')
          .insert([{ ...horario, dia_semana: dia }])

        if (error) throw error
      }

      await get().fetchHorarios()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  saveHorarios: async (horarios) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Guardando horarios...')
    try {
      const formatTime = (time: string): string => {
        if (!time) return '00:00:00'
        if (time.split(':').length === 3) return time
        return `${time}:00`
      }

      for (const horario of horarios) {
        const existingHorario = get().horarios.find(h => h.dia_semana === horario.dia_semana)

        const horarioData = {
          hora_apertura: formatTime(horario.hora_apertura),
          hora_cierre: formatTime(horario.hora_cierre),
          activo: horario.activo
        }

        if (existingHorario) {
          const { error } = await supabase
            .from('horarios_negocio')
            .update(horarioData)
            .eq('dia_semana', horario.dia_semana)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('horarios_negocio')
            .insert([{
              ...horarioData,
              dia_semana: horario.dia_semana
            }])

          if (error) throw error
        }
      }

      await get().fetchHorarios()
      return { success: true }
    } catch (error: any) {
      console.error('Error saving horarios:', error)
      return { success: false, error: error.message || 'Error al guardar los horarios' }
    } finally {
      ui.hideBlocking()
    }
  },

  subscribeToRealtimeUpdates: () => {
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription)
    }

    realtimeSubscription = supabase
      .channel('horarios-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'horarios_negocio'
        },
        async () => {
          console.log('Cambio en horarios detectado, refrescando...')
          await get().fetchHorarios()
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
