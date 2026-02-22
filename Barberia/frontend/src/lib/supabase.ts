import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Verificar modo de conexión
const isConnected = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')

if (isConnected) {
  console.log('✅ Conectado a Supabase:', supabaseUrl)
} else {
  console.log('⚠️ Modo DEMO activo - Usando localStorage')
  console.log('💡 Para conectar a Supabase, configura las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en frontend/.env')
}

// Si no hay configuración, crear un cliente dummy para evitar errores
export const supabase = isConnected
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')
