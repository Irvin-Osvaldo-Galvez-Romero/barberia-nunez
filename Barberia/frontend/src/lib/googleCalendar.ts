const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

let googleScriptLoading: Promise<void> | null = null
let tokenClient: google.accounts.oauth2.TokenClient | null = null
let accessToken: string | null = null

function loadGoogleScript(): Promise<void> {
  if (googleScriptLoading) return googleScriptLoading

  googleScriptLoading = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'))
    document.head.appendChild(script)
  })

  return googleScriptLoading
}

interface CalendarEventInput {
  summary: string
  description?: string
  start: Date
  end: Date
  location?: string
}

function getTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

async function ensureTokenClient(): Promise<void> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  if (!clientId) {
    throw new Error('Falta configurar VITE_GOOGLE_CLIENT_ID en el entorno')
  }

  await loadGoogleScript()

  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPE,
      prompt: '',
      callback: () => {
        /* callback se define en requestAccessToken */
      }
    })
  }
}

async function requestAccessToken(): Promise<string> {
  await ensureTokenClient()

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client no inicializado'))
      return
    }

    tokenClient.callback = (res) => {
      if (res.error) {
        reject(new Error(res.error_description || 'Error al obtener token de Google'))
        return
      }
      accessToken = res.access_token
      resolve(accessToken)
    }

    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' })
  })
}

async function createEvent(event: CalendarEventInput, calendarId = 'primary'): Promise<void> {
  const token = await requestAccessToken()
  const timeZone = getTimeZone()

  const body = {
    summary: event.summary,
    description: event.description,
    start: {
      dateTime: event.start.toISOString(),
      timeZone
    },
    end: {
      dateTime: event.end.toISOString(),
      timeZone
    },
    location: event.location
  }

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || 'No se pudo crear el evento en Google Calendar')
  }
}

export async function syncCitasToGoogleCalendar(options: {
  citas: Array<{
    id: string
    cliente_nombre: string
    servicios: { servicio_nombre: string }[]
    fecha_hora: string
    duracion?: number
    notas?: string
  }>
  calendarId?: string
  barberoNombre?: string
}): Promise<void> {
  const { citas, calendarId = 'primary', barberoNombre } = options

  if (!citas || citas.length === 0) return

  for (const cita of citas) {
    const start = new Date(cita.fecha_hora)
    const dur = cita.duracion && cita.duracion > 0 ? cita.duracion : 60
    const end = new Date(start.getTime() + dur * 60 * 1000)

    const summaryParts = [cita.cliente_nombre]
    if (barberoNombre) summaryParts.push(`con ${barberoNombre}`)
    const servicios = cita.servicios?.map(s => s.servicio_nombre).filter(Boolean)
    const descriptionLines = [] as string[]
    if (servicios && servicios.length > 0) descriptionLines.push(`Servicios: ${servicios.join(', ')}`)
    if (cita.notas) descriptionLines.push(`Notas: ${cita.notas}`)

    await createEvent({
      summary: summaryParts.join(' '),
      description: descriptionLines.join('\n'),
      start,
      end
    }, calendarId)
  }
}

declare global {
  interface Window {
    google: typeof google
  }

  // Tipos mínimos de Google Identity Services usados en este archivo
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace google {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace accounts {
      // eslint-disable-next-line @typescript-eslint/no-namespace
      namespace oauth2 {
        interface TokenResponse {
          access_token: string
          error?: string
          error_description?: string
        }

        interface TokenClient {
          callback: (response: TokenResponse) => void
          requestAccessToken: (options?: { prompt?: string }) => void
        }

        function initTokenClient(config: {
          client_id: string
          scope: string
          prompt?: string
          callback: (response: TokenResponse) => void
        }): TokenClient
      }
    }
  }
}

export {}