import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export type UserRole = 'ADMIN' | 'BARBERO' | 'RECEPCIONISTA'

export interface User {
  id: string
  email: string
  nombre: string
  rol: UserRole
}

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isDemoMode: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, nombre: string, rol: UserRole) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

// Función para mapear rol de BD a UserRole
const mapRolToUserRole = (rol: string): UserRole => {
  if (rol === 'ADMINISTRADOR') return 'ADMIN'
  if (rol === 'BARBERO') return 'BARBERO'
  if (rol === 'RECEPCIONISTA') return 'RECEPCIONISTA'
  return 'BARBERO' // default
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  isDemoMode: false,

  login: async (email: string, password: string) => {
    set({ loading: true })

    // Login con Supabase - buscar en tabla empleados
    try {
      const { data: empleado, error } = await supabase
        .from('empleados')
        .select('id, nombre, email, rol, password_hash, activo')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error || !empleado) {
        set({ loading: false })
        return { success: false, error: 'Credenciales inválidas' }
      }

      // Verificar si el empleado está activo
      if (!empleado.activo) {
        set({ loading: false })
        return { success: false, error: 'Tu cuenta está desactivada' }
      }

      // Verificar contraseña (comparación simple - en producción usar bcrypt)
      // NOTA: En producción, deberías usar bcrypt.compare() aquí
      // Por ahora, comparación directa (solo para desarrollo)
      if (empleado.password_hash !== password) {
        set({ loading: false })
        return { success: false, error: 'Credenciales inválidas' }
      }

      // Crear usuario
      const user: User = {
        id: empleado.id,
        email: empleado.email,
        nombre: empleado.nombre,
        rol: mapRolToUserRole(empleado.rol)
      }

      set({ user, isAuthenticated: true, loading: false })
      localStorage.setItem('barberia_auth', JSON.stringify(user))
      return { success: true }
    } catch (error: any) {
      set({ loading: false })
      return { success: false, error: error.message || 'Error al iniciar sesión' }
    }
  },

  register: async (_email: string, _password: string, _nombre: string, _rol: UserRole) => {
    set({ loading: false })
    return { success: false, error: 'El registro debe realizarse desde la base de datos' }
  },

  logout: async () => {
    // Limpiar sesión
    localStorage.removeItem('barberia_auth')
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    set({ loading: true })

    // Verificar si el usuario sigue existiendo y está activo en Supabase
    const stored = localStorage.getItem('barberia_auth')
    if (stored) {
      try {
        const savedUser = JSON.parse(stored)
        
        // Verificar que el empleado aún existe y está activo
        const { data: empleado, error } = await supabase
          .from('empleados')
          .select('id, nombre, email, rol, activo')
          .eq('id', savedUser.id)
          .single()

        if (error || !empleado || !empleado.activo) {
          // Usuario no existe o está inactivo, limpiar sesión
          localStorage.removeItem('barberia_auth')
          set({ user: null, isAuthenticated: false, loading: false })
          return
        }

        // Actualizar información del usuario
        const user: User = {
          id: empleado.id,
          email: empleado.email,
          nombre: empleado.nombre,
          rol: mapRolToUserRole(empleado.rol)
        }

        set({ user, isAuthenticated: true, loading: false })
        localStorage.setItem('barberia_auth', JSON.stringify(user))
        return
      } catch {
        // Si hay error, limpiar sesión
        localStorage.removeItem('barberia_auth')
      }
    }
    set({ loading: false })
  }
}))
