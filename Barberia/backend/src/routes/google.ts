import { Router } from 'express'
import { google } from 'googleapis'
import { config } from '../config.js'
import { supabase } from '../supabase.js'
import googleInvitationRouter from './googleInvitation.js'

const router = Router()

// Registrar rutas de invitación
router.use('/', googleInvitationRouter)

// Cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
)

const SCOPES = ['https://www.googleapis.com/auth/calendar.events']

// Función auxiliar: Convertir hora BD a formato correcto para Google Calendar
// La BD almacena la hora en formato ISO (UTC), pero debe interpretarse como hora LOCAL
function convertToLocalDateTime(dbDateTime: string): string {
  // dbDateTime viene en formato "2026-01-26T08:00:00..." (UTC)
  // Pero representa la hora LOCAL del calendario semanal
  // Necesitamos enviarlo a Google como "2026-01-26T08:00:00" sin la Z
  
  const date = new Date(dbDateTime)
  
  // Crear formato ISO pero sin la Z (sin UTC)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

// GET /api/google/auth-url - Genera URL de autorización
router.get('/auth-url', async (req, res) => {
  try {
    const userId = req.query.user_id as string
    if (!userId) {
      return res.status(400).json({ error: 'Falta user_id' })
    }

    // Verificar que el usuario existe y es barbero
    const { data: empleado, error } = await supabase
      .from('empleados')
      .select('id, rol')
      .eq('id', userId)
      .single()

    if (error || !empleado) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (empleado.rol !== 'BARBERO') {
      return res.status(403).json({ error: 'Solo barberos pueden conectar Google Calendar' })
    }

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: userId, // Pasamos el user_id en el state
      prompt: 'consent' // Fuerza pedir refresh_token
    })

    res.json({ authUrl })
  } catch (err) {
    console.error('Error generando auth URL:', err)
    res.status(500).json({ error: 'Error generando URL de autorización' })
  }
})

// GET /api/google/callback - Callback OAuth (intercambia code por tokens)
router.get('/callback', async (req, res) => {
  try {
    const code = req.query.code as string
    const userId = req.query.state as string

    if (!code || !userId) {
      return res.redirect(`${config.frontendUrl}?error=missing_params`)
    }

    // Intercambiar code por tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Calcular expires_at
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000)

    // Guardar o actualizar tokens en BD
    const { error } = await supabase
      .from('google_tokens')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      })

    if (error) {
      console.error('Error guardando tokens:', error)
      return res.redirect(`${config.frontendUrl}?error=db_error`)
    }

    // Redirigir al frontend con éxito
    res.redirect(`${config.frontendUrl}/dashboard?google_connected=true`)
  } catch (err) {
    console.error('Error en callback:', err)
    res.redirect(`${config.frontendUrl}?error=oauth_failed`)
  }
})

// POST /api/google/sync - Sincronizar citas con Google Calendar
router.post('/sync', async (req, res) => {
  try {
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'Falta user_id' })
    }

    // Obtener tokens del usuario
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_id', user_id)
      .eq('provider', 'google')
      .single()

    if (tokenError || !tokenData) {
      return res.status(404).json({ error: 'No hay tokens guardados. Conecta Google Calendar primero.' })
    }

    // Verificar si el token expiró y refrescar si es necesario
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)

    if (now >= expiresAt && tokenData.refresh_token) {
      oauth2Client.setCredentials({
        refresh_token: tokenData.refresh_token
      })

      const { credentials } = await oauth2Client.refreshAccessToken()
      
      // Actualizar tokens en BD
      await supabase
        .from('google_tokens')
        .update({
          access_token: credentials.access_token,
          expires_at: credentials.expiry_date 
            ? new Date(credentials.expiry_date).toISOString()
            : new Date(Date.now() + 3600 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .eq('provider', 'google')

      // Usar el nuevo token
      tokenData.access_token = credentials.access_token
    }

    oauth2Client.setCredentials({
      access_token: tokenData.access_token
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Obtener citas del barbero (próximas 7 días)
    // Convertir a formato local literal para comparación correcta
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const formatDateLocal = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    }
    
    const startDateLocal = formatDateLocal(startDate)
    const endDateLocal = formatDateLocal(endDate)

    console.log(`🔍 Buscando citas entre ${startDateLocal} y ${endDateLocal}`)

    const { data: citas, error: citasError } = await supabase
      .from('citas')
      .select(`
        *,
        clientes:cliente_id(nombre, telefono),
        empleados:barbero_id(nombre),
        servicios_citas(
          servicio_id,
          precio,
          servicios:servicio_id(nombre)
        )
      `)
      .eq('barbero_id', user_id)
      .gte('fecha_hora', startDateLocal)
      .lte('fecha_hora', endDateLocal)
      .order('fecha_hora', { ascending: true })

    if (citasError) {
      return res.status(500).json({ error: 'Error obteniendo citas' })
    }

    if (!citas || citas.length === 0) {
      return res.json({ message: 'No hay citas próximas para sincronizar', synced: 0 })
    }

    console.log(`📋 Procesando ${citas.length} citas...`)

    let synced = 0
    let errors = 0
    let skipped = 0

    for (const cita of citas) {
      try {
        // Verificar si ya existe evento para esta cita
        const { data: existingEvent } = await supabase
          .from('google_events')
          .select('event_id')
          .eq('cita_id', cita.id)
          .eq('user_id', user_id)
          .single()

        if (existingEvent) {
          console.log(`⏭️  Cita ${cita.id} ya sincronizada, saltando...`)
          skipped++
          continue // Ya sincronizada, saltar
        }

        // Preparar datos del evento
        const start = new Date(cita.fecha_hora)
        const duracion = cita.duracion || 60

        const servicios = cita.servicios_citas?.map((sc: { servicios?: { nombre?: string } | null }) => sc.servicios?.nombre).filter(Boolean) || []
        const summary = `${cita.clientes?.nombre || 'Cliente'} - ${servicios.join(', ')}`
        const description = [
          `Cliente: ${cita.clientes?.nombre || 'N/A'}`,
          cita.clientes?.telefono ? `Tel: ${cita.clientes.telefono}` : '',
          servicios.length > 0 ? `Servicios: ${servicios.join(', ')}` : '',
          cita.notas ? `Notas: ${cita.notas}` : ''
        ].filter(Boolean).join('\n')

        // Crear evento en Google Calendar
        console.log(`📅 Creando evento para cita ${cita.id}:`, summary)
        
        // Convertir horas MANTENIENDO la hora local (sin conversión a UTC)
        const startLocal = convertToLocalDateTime(cita.fecha_hora)
        const endLocal = convertToLocalDateTime(new Date(start.getTime() + duracion * 60 * 1000).toISOString())
        
        // Obtener zona horaria actual del servidor
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        
        console.log(`⏰ Hora original BD: ${cita.fecha_hora}`)
        console.log(`⏰ Hora enviada a Google: ${startLocal}`)
        console.log(`⏰ Zona horaria: ${timeZone}`)
        
        const event = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary,
            description,
            start: {
              dateTime: startLocal,
              timeZone
            },
            end: {
              dateTime: endLocal,
              timeZone
            },
            reminders: {
              useDefault: true
            }
          }
        })

        console.log(`✅ Evento creado: ${event.data.id}`)

        // Registrar en google_events
        await supabase
          .from('google_events')
          .insert({
            cita_id: cita.id,
            user_id: user_id,
            calendar_id: 'primary',
            event_id: event.data.id!,
            status: event.data.status || 'confirmed',
            synced_at: new Date().toISOString()
          })

        synced++
      } catch (err) {
        errors++
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        console.error(`❌ Error sincronizando cita ${cita.id}:`, errorMsg)
        if (err instanceof Error && err.stack) {
          console.error('Stack:', err.stack)
        }

        // Registrar error
        await supabase
          .from('google_events')
          .upsert({
            cita_id: cita.id,
            user_id: user_id,
            calendar_id: 'primary',
            event_id: 'error',
            status: 'error',
            last_error: errorMsg,
            synced_at: new Date().toISOString()
          }, {
            onConflict: 'cita_id,user_id'
          })
      }
    }

    console.log(`📊 Sincronización completada: ${synced} exitosas, ${errors} errores, ${skipped} saltadas de ${citas.length} citas`)

    res.json({
      message: `Sincronización completada: ${synced} cita(s) sincronizada(s)`,
      synced,
      errors,
      total: citas.length
    })
  } catch (err) {
    console.error('❌ Error en sync:', err)
    const errorMsg = err instanceof Error ? err.message : 'Error sincronizando con Google Calendar'
    res.status(500).json({ error: errorMsg })
  }
})

// POST /api/google/sync-all - Sincronizar citas de TODOS los barberos (admin/recepcionista)
router.post('/sync-all', async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronización de todos los barberos...')

    // Obtener todos los barberos con tokens
    const { data: barberos, error: barbError } = await supabase
      .from('google_tokens')
      .select('user_id')
      .eq('provider', 'google')
      .eq('scope', 'https://www.googleapis.com/auth/calendar.events')

    if (barbError || !barberos || barberos.length === 0) {
      return res.json({ message: 'No hay barberos con Google Calendar conectado', synced: 0, total: 0 })
    }

    console.log(`👥 Encontrados ${barberos.length} barberos con tokens`)

    // Sincronizar cada barbero en paralelo (más rápido)
    const resultados = await Promise.all(
      barberos.map(b => sincronizarBarbero(b.user_id))
    )

    const totalSynced = resultados.reduce((sum, r) => sum + r.synced, 0)
    const totalErrors = resultados.reduce((sum, r) => sum + r.errors, 0)
    const totalCitas = resultados.reduce((sum, r) => sum + r.total, 0)

    console.log(`📊 Sincronización total: ${totalSynced} exitosas, ${totalErrors} errores de ${totalCitas} citas`)

    res.json({
      message: `Sincronización completada: ${totalSynced} cita(s) sincronizada(s)`,
      synced: totalSynced,
      errors: totalErrors,
      total: totalCitas,
      barberos_procesados: barberos.length
    })
  } catch (err) {
    console.error('❌ Error en sync-all:', err)
    const errorMsg = err instanceof Error ? err.message : 'Error sincronizando todos los barberos'
    res.status(500).json({ error: errorMsg })
  }
})

// Función auxiliar para sincronizar un barbero específico
async function sincronizarBarbero(user_id: string) {
  let synced = 0
  let errors = 0
  let total = 0

  try {
    // Obtener tokens del usuario
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_id', user_id)
      .eq('provider', 'google')
      .single()

    if (tokenError || !tokenData) {
      console.warn(`⚠️ No hay tokens para barbero ${user_id}`)
      return { synced, errors, total }
    }

    // Verificar si token expiró y refrescar
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)

    let accessToken = tokenData.access_token
    if (now >= expiresAt && tokenData.refresh_token) {
      oauth2Client.setCredentials({
        refresh_token: tokenData.refresh_token
      })

      const { credentials } = await oauth2Client.refreshAccessToken()
      
      await supabase
        .from('google_tokens')
        .update({
          access_token: credentials.access_token,
          expires_at: credentials.expiry_date 
            ? new Date(credentials.expiry_date).toISOString()
            : new Date(Date.now() + 3600 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .eq('provider', 'google')

      accessToken = credentials.access_token || tokenData.access_token
    }

    oauth2Client.setCredentials({
      access_token: accessToken
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Obtener citas del barbero (próximas 7 días)
    // Convertir a formato local literal para comparación correcta
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const formatDateLocal = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    }
    
    const startDateLocal = formatDateLocal(startDate)
    const endDateLocal = formatDateLocal(endDate)

    const { data: citas, error: citasError } = await supabase
      .from('citas')
      .select(`
        *,
        clientes:cliente_id(nombre, telefono),
        empleados:barbero_id(nombre),
        servicios_citas(
          servicio_id,
          precio,
          servicios:servicio_id(nombre)
        )
      `)
      .eq('barbero_id', user_id)
      .gte('fecha_hora', startDateLocal)
      .lte('fecha_hora', endDateLocal)
      .order('fecha_hora', { ascending: true })

    if (citasError || !citas || citas.length === 0) {
      return { synced, errors, total }
    }

    total = citas.length

    // Crear eventos en paralelo (MÁS RÁPIDO)
    const promesasEventos = citas.map(async (cita) => {
      try {
        // Verificar si ya existe evento
        const { data: existingEvent } = await supabase
          .from('google_events')
          .select('event_id')
          .eq('cita_id', cita.id)
          .eq('user_id', user_id)
          .single()

        if (existingEvent) {
          return { success: false }
        }

        // Preparar datos
        const start = new Date(cita.fecha_hora)
        const duracion = cita.duracion || 60

        const servicios = cita.servicios_citas?.map((sc: { servicios?: { nombre?: string } | null }) => sc.servicios?.nombre).filter(Boolean) || []
        const summary = `${cita.clientes?.nombre || 'Cliente'} - ${servicios.join(', ')}`
        const description = [
          `Cliente: ${cita.clientes?.nombre || 'N/A'}`,
          cita.clientes?.telefono ? `Tel: ${cita.clientes.telefono}` : '',
          servicios.length > 0 ? `Servicios: ${servicios.join(', ')}` : '',
          cita.notas ? `Notas: ${cita.notas}` : ''
        ].filter(Boolean).join('\n')

        // Convertir horas MANTENIENDO la hora local (sin conversión a UTC)
        const startLocal = convertToLocalDateTime(cita.fecha_hora)
        const endLocal = convertToLocalDateTime(new Date(start.getTime() + duracion * 60 * 1000).toISOString())

        // Obtener zona horaria actual del servidor
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

        // Crear evento
        const event = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary,
            description,
            start: {
              dateTime: startLocal,
              timeZone
            },
            end: {
              dateTime: endLocal,
              timeZone
            },
            reminders: {
              useDefault: true
            }
          }
        })

        // Registrar en BD
        await supabase
          .from('google_events')
          .insert({
            cita_id: cita.id,
            user_id: user_id,
            calendar_id: 'primary',
            event_id: event.data.id!,
            status: event.data.status || 'confirmed',
            synced_at: new Date().toISOString()
          })

        return { success: true }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        console.error(`❌ Error en cita ${cita.id} de barbero ${user_id}:`, errorMsg)
        return { success: false }
      }
    })

    const resultados = await Promise.all(promesasEventos)
    synced = resultados.filter(r => r.success).length
    errors = resultados.filter(r => !r.success).length

  } catch (err) {
    console.error(`❌ Error sincronizando barbero ${user_id}:`, err)
    errors++
  }

  return { synced, errors, total }
}

// GET /api/google/status - Verificar si el usuario tiene tokens guardados
router.get('/status', async (req, res) => {
  try {
    const userId = req.query.user_id as string
    if (!userId) {
      return res.status(400).json({ error: 'Falta user_id' })
    }

    const { data, error } = await supabase
      .from('google_tokens')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single()

    if (error || !data) {
      return res.json({ connected: false })
    }

    res.json({ connected: true, connectedAt: data.created_at })
  } catch (err) {
    res.status(500).json({ error: 'Error verificando estado' })
  }
})

export default router
