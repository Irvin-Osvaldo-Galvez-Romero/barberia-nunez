import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useUiStore } from './uiStore'
import { RealtimeChannel } from '@supabase/supabase-js'

let realtimeSubscription: RealtimeChannel | null = null

export interface InformacionNegocio {
  nombre: string
  telefono: string
  email: string
  direccion: string
  descripcion?: string
}

export interface ConfiguracionGeneral {
  moneda: string
  formato_fecha: string
  zona_horaria: string
  idioma: string
}

export interface ConfiguracionNotificaciones {
  recordatorio_citas: boolean
  confirmacion_automatica: boolean
  recordatorio_horas_antes: number
}

interface ConfiguracionState {
  informacionNegocio: InformacionNegocio
  configuracionGeneral: ConfiguracionGeneral
  configuracionNotificaciones: ConfiguracionNotificaciones
  loading: boolean
  fetchConfiguracion: () => Promise<void>
  updateInformacionNegocio: (info: Partial<InformacionNegocio>) => Promise<{ success: boolean; error?: string }>
  updateConfiguracionGeneral: (config: Partial<ConfiguracionGeneral>) => Promise<{ success: boolean; error?: string }>
  updateConfiguracionNotificaciones: (config: Partial<ConfiguracionNotificaciones>) => Promise<{ success: boolean; error?: string }>
  subscribeToRealtimeUpdates: () => void
  unsubscribeFromRealtimeUpdates: () => void
}

const defaultInformacionNegocio: InformacionNegocio = {
  nombre: 'Barbería Ejemplo',
  telefono: '555-1234',
  email: 'contacto@barberia.com',
  direccion: 'Av. Principal 123, Ciudad',
  descripcion: 'Tu barbería de confianza'
}

const defaultConfiguracionGeneral: ConfiguracionGeneral = {
  moneda: 'USD',
  formato_fecha: 'DD/MM/YYYY',
  zona_horaria: 'America/Mexico_City',
  idioma: 'es'
}

const defaultConfiguracionNotificaciones: ConfiguracionNotificaciones = {
  recordatorio_citas: true,
  confirmacion_automatica: false,
  recordatorio_horas_antes: 24
}

export const useConfiguracionStore = create<ConfiguracionState>((set, get) => ({
  informacionNegocio: defaultInformacionNegocio,
  configuracionGeneral: defaultConfiguracionGeneral,
  configuracionNotificaciones: defaultConfiguracionNotificaciones,
  loading: false,

  fetchConfiguracion: async () => {
    set({ loading: true })

    try {
      const { data: infoNegocio, error: errorInfo } = await supabase
        .from('informacion_negocio')
        .select('*')
        .limit(1)
        .single()

      if (errorInfo && errorInfo.code !== 'PGRST116') {
        console.error('Error fetching informacion_negocio:', errorInfo)
      }

      const { data: configGeneral, error: errorGeneral } = await supabase
        .from('configuracion_general')
        .select('*')
        .limit(1)
        .single()

      if (errorGeneral && errorGeneral.code !== 'PGRST116') {
        console.error('Error fetching configuracion_general:', errorGeneral)
      }

      const { data: configNotif, error: errorNotif } = await supabase
        .from('configuracion_notificaciones')
        .select('*')
        .limit(1)
        .single()

      if (errorNotif && errorNotif.code !== 'PGRST116') {
        console.error('Error fetching configuracion_notificaciones:', errorNotif)
      }

      set({
        informacionNegocio: infoNegocio || defaultInformacionNegocio,
        configuracionGeneral: configGeneral || defaultConfiguracionGeneral,
        configuracionNotificaciones: configNotif || defaultConfiguracionNotificaciones,
        loading: false
      })
    } catch (error: any) {
      console.error('Error fetching configuracion:', error)
      set({ loading: false })
    }
  },

  updateInformacionNegocio: async (info) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Guardando información del negocio...')
    try {
      const estado = get()
      let result = { success: false }

      const { data: existing } = await supabase
        .from('informacion_negocio')
        .select('id')
        .limit(1)
        .single()

      if (existing) {
        // Actualizar registro existente
        const { error } = await supabase
          .from('informacion_negocio')
          .update(info)
          .eq('id', existing.id)

        if (error) throw error
        result = { success: true }
      } else {
        // Insertar nuevo registro
        const { error } = await supabase
          .from('informacion_negocio')
          .insert([info])

        if (error) throw error
        result = { success: true }
      }

      set(state => ({ informacionNegocio: { ...state.informacionNegocio, ...info } }))

      await get().fetchConfiguracion()

      return result
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  updateConfiguracionGeneral: async (config) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Guardando configuración general...')
    try {
      const estado = get()
      let result = { success: false }

      const { data: existing } = await supabase
        .from('configuracion_general')
        .select('id')
        .limit(1)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('configuracion_general')
          .update(config)
          .eq('id', existing.id)

        if (error) throw error
        result = { success: true }
      } else {
        const { error } = await supabase
          .from('configuracion_general')
          .insert([config])

        if (error) throw error
        result = { success: true }
      }

      set(state => ({ configuracionGeneral: { ...state.configuracionGeneral, ...config } }))

      await get().fetchConfiguracion()

      return result
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  updateConfiguracionNotificaciones: async (config) => {
    const ui = useUiStore.getState()
    ui.showBlocking('Guardando configuración de notificaciones...')
    try {
      const estado = get()
      let result = { success: false }

      const { data: existing } = await supabase
        .from('configuracion_notificaciones')
        .select('id')
        .limit(1)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('configuracion_notificaciones')
          .update(config)
          .eq('id', existing.id)

        if (error) throw error
        result = { success: true }
      } else {
        const { error } = await supabase
          .from('configuracion_notificaciones')
          .insert([config])

        if (error) throw error
        result = { success: true }
      }

      set(state => ({ configuracionNotificaciones: { ...state.configuracionNotificaciones, ...config } }))

      await get().fetchConfiguracion()

      return result
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      ui.hideBlocking()
    }
  },

  subscribeToRealtimeUpdates: () => {
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription)
    }

    realtimeSubscription = supabase
      .channel('configuracion-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'configuracion_general'
        },
        async () => {
          console.log('Cambio en configuración detectado, refrescando...')
          await get().fetchConfiguracion()
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
