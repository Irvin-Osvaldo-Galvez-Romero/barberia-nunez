import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import googleRouter from './routes/google.js'
import { inicializarGmailOAuth } from './services/gmailService.js'

const app = express()

// Inicializar Gmail API
inicializarGmailOAuth()

// Middlewares
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://localhost:5174'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || /^http:\/\/localhost:517\d$/.test(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Endpoint de prueba para Gmail
app.get('/test-gmail', async (req, res) => {
  try {
    const { enviarCorreo } = await import('./services/gmailService.js')
    
    await enviarCorreo(
      'nunezbarbershopp@gmail.com',
      '🧪 Test Gmail API - Barbería',
      '<h1>✅ Gmail API Funciona!</h1><p>Tu sistema de correos está listo para enviar confirmaciones y recordatorios de citas.</p>'
    )
    
    res.json({ 
      success: true, 
      message: 'Email de prueba enviado correctamente',
      email: 'nunezbarbershopp@gmail.com'
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al enviar email' 
    })
  }
})

// Endpoint para verificar configuración de Gmail
app.get('/gmail-status', async (req, res) => {
  try {
    const { verificarConfiguracionGmail } = await import('./services/gmailService.js')
    const status = await verificarConfiguracionGmail()
    res.json(status)
  } catch (error) {
    res.status(500).json({ 
      configurado: false, 
      error: error instanceof Error ? error.message : 'Error al verificar Gmail' 
    })
  }
})

// Rutas
app.use('/api/google', googleRouter)

// Iniciar servidor
app.listen(config.port, () => {
  console.log(`🚀 Backend ejecutándose en http://localhost:${config.port}`)
  console.log(`📅 Google Calendar OAuth configurado`)
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`)
})
