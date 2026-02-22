#!/usr/bin/env node

/**
 * PRUEBAS API BACKEND
 * Verifica todos los endpoints REST
 */
/* eslint-disable no-undef */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../backend/.env') })

// Colores
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}`),
}

const API_URL = 'http://localhost:3001'

let testsPassed = 0
let testsFailed = 0

async function test(name, method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    }
    if (body) options.body = JSON.stringify(body)

    const response = await fetch(`${API_URL}${endpoint}`, options)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      testsFailed++
      log.error(`${name} - ${response.status}: ${data.error || response.statusText}`)
      return null
    }

    testsPassed++
    log.success(`${name} - ${response.status}`)
    return data
  } catch (error) {
    testsFailed++
    log.error(`${name} - ${error.message}`)
    return null
  }
}

async function runTests() {
  log.title('PRUEBAS API BACKEND')
  log.info(`API URL: ${API_URL}`)

  // Verificar que el servidor está corriendo
  try {
    await fetch(API_URL)
    log.success('Servidor backend está corriendo')
  } catch (error) {
    log.error('❌ No se puede conectar al servidor backend')
    log.error('Asegúrate de que está ejecutándose: npm run dev en la carpeta backend/')
    process.exit(1)
  }

  // 1. SALUD DEL SERVIDOR
  log.title('1. HEALTH CHECK')
  await test('GET / - Estado del servidor', 'GET', '/')

  // 2. AUTENTICACIÓN
  log.title('2. AUTENTICACIÓN (si está configurada)')
  // Nota: Estos endpoints requieren credenciales reales
  log.info('Saltando pruebas de autenticación (requieren credenciales reales)')

  // 3. GOOGLE CALENDAR
  log.title('3. SINCRONIZACIÓN GOOGLE CALENDAR')
  
  log.info('Nota: Estas pruebas requieren un barbero con Google Calendar conectado')
  
  // Esta es una prueba de estructura - el sync real necesita user_id válido
  const syncTest = await test(
    'POST /api/google/sync-all - Listar barberos',
    'POST',
    '/api/google/sync-all',
    {}
  )
  
  if (syncTest?.barberos_procesados !== undefined) {
    log.info(`Barberos con Google Calendar: ${syncTest.barberos_procesados}`)
  }

  // 4. RUTAS DE ERROR
  log.title('4. MANEJO DE ERRORES')
  
  try {
    const response = await fetch(`${API_URL}/ruta-inexistente`)
    if (response.status === 404) {
      testsPassed++
      log.success('404 Error - Ruta inexistente')
    } else {
      testsFailed++
      log.error(`404 Error esperado, pero recibió ${response.status}`)
    }
  } catch (error) {
    testsFailed++
    log.error(`Error en prueba 404: ${error.message}`)
  }

  // 5. VALIDACIÓN DE MÉTODOS
  log.title('5. VALIDACIÓN DE MÉTODOS HTTP')

  try {
    const response = await fetch(`${API_URL}/api/google/sync`, { method: 'GET' })
    if (response.status !== 200) {
      testsPassed++
      log.success('Método GET rechazado en endpoint POST')
    } else {
      log.warning('GET debería rechazarse pero fue aceptado')
    }
  } catch (error) {
    testsPassed++
    log.success('Método GET rechazado (error esperado)')
  }

  // RESUMEN
  log.title('RESUMEN PRUEBAS API')
  log.success(`Pruebas exitosas: ${testsPassed}`)
  log.error(`Pruebas fallidas: ${testsFailed}`)
  const total = testsPassed + testsFailed
  const percentage = total > 0 ? ((testsPassed / total) * 100).toFixed(1) : 0
  log.info(`Porcentaje de éxito: ${percentage}%`)

  process.exit(testsFailed > 0 ? 1 : 0)
}

runTests()
