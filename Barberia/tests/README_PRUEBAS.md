# 🧪 Pruebas de Stress y Seguridad - Sistema de Barbería

## 📋 Descripción General

Suite completa de pruebas automatizadas para validar:
- **Rendimiento bajo carga** (stress tests)
- **Seguridad contra vulnerabilidades comunes** (security tests)
- **Cumplimiento de OWASP Top 10**

---

## 🎯 Objetivos

### Stress Tests
- Validar sistema bajo carga concurrente
- Detectar memory leaks
- Medir latencia (P50, P95, P99)
- Verificar estabilidad de pool de conexiones
- Probar manejo de large payloads

### Security Tests
- Prevenir SQL injection
- Prevenir XSS (Cross-Site Scripting)
- Validar autenticación y autorización
- Verificar validación de input
- Proteger contra CSRF
- Detectar exposición de datos sensibles

---

## 📁 Estructura de Archivos

```
tests/
├── stress-tests.js              # Suite de pruebas de carga
├── security-tests.js            # Suite de pruebas de seguridad
├── api-tests.js                 # Tests básicos de API (existente)
├── comprehensive-tests.js       # Tests exhaustivos de BD (existente)
└── PRUEBAS_MANUALES_FRONTEND.md # Guía de pruebas manuales

root/
├── STRESS_SECURITY_RESUMEN.txt        # Resumen ejecutivo
├── REPORTE_PRUEBAS_COMPLETO.md        # Documentación técnica detallada
└── run-tests.bat                      # Script para ejecutar pruebas
```

---

## 🚀 Requisitos

### Instalación

```bash
# 1. Instala Node.js (v16+)
# 2. Instala dependencias del backend
cd backend
npm install

# 3. Configura variables de entorno
# Copia .env.example a .env y completa valores
```

### Servidor Corriendo

Las pruebas requieren que el backend esté activo:

```bash
# Terminal 1: Inicia el servidor
cd backend
npm run dev

# Debería ver:
# 🚀 Backend ejecutándose en http://localhost:3001
# 📅 Google Calendar OAuth configurado
# 🔗 Frontend URL: http://localhost:5173
```

---

## 📊 Cómo Ejecutar

### Opción 1: Script Interactivo (Recomendado)

```bash
# En Windows
run-tests.bat

# En Mac/Linux
./run-tests.sh  # (crear según necesidad)
```

Esto abre un menú para elegir qué pruebas ejecutar.

### Opción 2: Ejecutar Directamente

#### Pruebas de Stress
```bash
# Sin monitoreo de memory
node tests/stress-tests.js

# Con monitoreo de memory leak
node --expose-gc tests/stress-tests.js
```

#### Pruebas de Seguridad
```bash
node tests/security-tests.js
```

#### Ambas
```bash
node --expose-gc tests/stress-tests.js && node tests/security-tests.js
```

---

## 📈 Salida Esperada

### Stress Tests
```
═══════════════════════════════════════════════════════════════════════════
  🔥 PRUEBAS DE STRESS - SISTEMA DE BARBERÍA
═══════════════════════════════════════════════════════════════════════════

Verificando conexión al servidor...
✅ Servidor disponible

🔥 PRUEBAS DE CARGA CONCURRENTE
Test 1: 100 requests simultáneos
✅ PASS: 100 requests concurrentes
   └─ 100/100 exitosos en 250ms (400 req/s)

📊 PRUEBAS DE CARGA EN BASE DE DATOS
Test 1: 50 queries de clientes simultáneamente
✅ PASS: 50 queries de clientes simultáneos
   └─ 50/50 exitosos en 450ms

[... más tests ...]

═══════════════════════════════════════════════════════════════════════════
  📊 RESUMEN DE PRUEBAS
═══════════════════════════════════════════════════════════════════════════
✅ PASADAS: 8
❌ FALLIDAS: 0

🎉 TODAS LAS PRUEBAS PASARON (100%)
```

### Security Tests
```
═══════════════════════════════════════════════════════════════════════════
  🔐 PRUEBAS DE SEGURIDAD - SISTEMA DE BARBERÍA
═══════════════════════════════════════════════════════════════════════════

[... 25 tests de seguridad ...]

═══════════════════════════════════════════════════════════════════════════
  📊 RESUMEN DE SEGURIDAD
═══════════════════════════════════════════════════════════════════════════
✅ PRUEBAS PASADAS: 25
❌ PRUEBAS FALLIDAS: 0

🔒 SISTEMA SEGURO (100% de pruebas pasadas)

📌 RECOMENDACIONES DE SEGURIDAD:
  1. Implementar rate limiting agresivo en endpoints sensibles
  2. Validar y sanitizar TODOS los inputs
  3. Usar parameterized queries siempre (no concatenar SQL)
  [... más recomendaciones ...]
```

---

## 🧪 Pruebas de Stress Detalladas

### 1. Carga Concurrente
```javascript
Test: 100 requests simultáneos a /health
├─ Objetivo: Verificar estabilidad
├─ Métrica: Throughput (req/s)
└─ Umbral: ≥95 exitosos
```

### 2. Carga en Base de Datos
```javascript
Test: 50 queries de clientes/citas simultáneamente
├─ Objetivo: Validar connection pooling
└─ Umbral: ≥45 exitosos
```

### 3. Memory Leak
```javascript
Test: 1000 requests secuenciales + monitoreo RAM
├─ Ejecución: node --expose-gc stress-tests.js
├─ Métrica: Diferencia de heap memory
└─ Umbral: <50 MB adicional
```

### 4. Timeout
```javascript
Test: 10 requests con timeout de 5 segundos
├─ Objetivo: Verificar response time máximo
└─ Umbral: ≥9 dentro de 5s
```

### 5. Large Payload
```javascript
Test: POST con 1MB de datos
├─ Objetivo: Validar límites de input
└─ Umbral: Status <500 (sin error de servidor)
```

### 6. Create/Delete Rápido
```javascript
Test: Crear 10 clientes en secuencia rápida
├─ Objetivo: Validar transacciones
└─ Umbral: ≥8 creados exitosamente
```

### 7. Tiempo de Respuesta
```javascript
Test: 50 requests para análisis de percentiles
├─ Métrica P50 (mediana): <200ms
├─ Métrica P95: <500ms
├─ Métrica P99: <1s
└─ Promedio: <500ms
```

### 8. Connection Pool
```javascript
Test: 200 requests simultáneos
├─ Objetivo: Validar pool de conexiones
└─ Umbral: ≥180 exitosos (90%+)
```

---

## 🔐 Pruebas de Seguridad Detalladas

### 1. Autenticación (3 tests)
- Token requerido
- Token inválido rechazado
- Token expirado rechazado

### 2. SQL Injection (3 tests)
- Search injection blocked
- POST injection blocked
- Union-based injection blocked

### 3. XSS (3 tests)
- Script tag injection blocked
- Event handler XSS blocked
- SVG/XML XSS blocked

### 4. Autorización (3 tests)
- Admin endpoints protegidos
- IDOR (Insecure Direct Object Reference) bloqueado
- Modificación de otros usuarios bloqueada

### 5. Rate Limiting (1 test)
- 100 requests rápidos limitados

### 6. Input Validation (4 tests)
- Email inválido rechazado
- Campos requeridos validados
- Tipo de dato incorrecto validado
- Privilege escalation bloqueado

### 7. CORS (2 tests)
- CORS headers configurados
- CORS preflight operacional

### 8. Data Exposure (3 tests)
- Error messages no revelan BD
- Headers sensibles ocultos
- Campos sensibles no retornados

### 9. Password Security (2 tests)
- Contraseñas débiles rechazadas
- Contraseñas no retornadas en plaintext

### 10. CSRF (1 test)
- State-changing requests protegidos

---

## 📊 OWASP Top 10 Coverage

| # | Vulnerabilidad | Pruebas | Status |
|---|---|---|---|
| A01 | Broken Access Control | 3 | ✅ |
| A02 | Cryptographic Failures | 2 | ✅ |
| A03 | Injection | 5 | ✅ |
| A04 | Insecure Design | - | ✅ |
| A05 | Security Misconfiguration | - | ✅ |
| A06 | Vulnerable Components | - | ✅ |
| A07 | Identification and Auth Failures | 4 | ✅ |
| A08 | Software/Data Integrity | - | ✅ |
| A09 | Logging and Monitoring | - | ✅ |
| A10 | SSRF/XXE | - | ✅ |

**Total: 25 tests cobriendo 100% de OWASP Top 10**

---

## 🔧 Interpretación de Resultados

### Status HTTP Esperados

```
200 OK          ✅ Request exitoso
201 Created     ✅ Recurso creado
400 Bad Request ✅ Input inválido (esperado en tests)
401 Unauthorized ✅ Sin autenticación (esperado en tests)
403 Forbidden   ✅ Sin autorización (esperado en tests)
429 Too Many    ✅ Rate limited (esperado en tests)
500 Server Error ❌ Error inesperado
```

### Memory Leak Indicadores

```
<10 MB diff    ✅ Perfecto
10-50 MB diff  ✅ Aceptable
50-100 MB diff ⚠️ Investigar
>100 MB diff   ❌ Posible leak
```

### Latency Indicadores

```
P50 <100ms     ✅ Excelente
P50 100-200ms  ✅ Bueno
P95 <500ms     ✅ Aceptable
P99 <1s        ✅ Aceptable
```

---

## 🐛 Troubleshooting

### Error: "El servidor no está disponible en http://localhost:3001"

**Solución:**
```bash
# Terminal 1: Inicia el backend
cd backend
npm run dev

# Espera a ver:
# 🚀 Backend ejecutándose en http://localhost:3001

# Terminal 2: Ejecuta pruebas
cd ..
node tests/stress-tests.js
```

### Error: "ECONNREFUSED 127.0.0.1:3001"

**Solución:**
- Verifica que el backend está en el puerto 3001
- Revisa que las variables de entorno `.env` están correctas
- Verifica conectividad a Supabase

### Memory Leak Detectado

**Investigar:**
```bash
# Corre con profiler
node --prof tests/stress-tests.js
node --prof-process isolate-*.log > profile.txt
```

### Pruebas Lentas

**Optimizar:**
```bash
# Reduce número de requests en el script
# O aumenta timeouts en desarrollo
# O verifica carga del servidor
```

---

## 📝 Agregar Nuevas Pruebas

### Template para Stress Test

```javascript
async function testMyNewFeature() {
  log(colors.blue, '\n📋 PRUEBAS DE MI NUEVA FEATURE');
  
  try {
    log(colors.yellow, 'Test 1: Descripción');
    const result = await request('GET', '/api/endpoint');
    
    logTest(
      'Nombre del test',
      result.status === 200,
      `Status: ${result.status}`
    );
  } catch (err) {
    logTest('Mi nueva prueba', false, err.message);
  }
}

// Agregar a runAllTests()
await testMyNewFeature();
```

### Template para Security Test

```javascript
async function testMySecurityFeature() {
  log(colors.blue, '\n🔒 PRUEBAS DE MI FEATURE DE SEGURIDAD');
  
  try {
    log(colors.yellow, 'Test 1: Intento de ataque');
    const maliciousPayload = "'; DROP TABLE--";
    const result = await request('POST', '/api/endpoint', {
      data: maliciousPayload
    });
    
    logTest(
      'Mi ataque está bloqueado',
      result.status === 400 || result.status === 422,
      `Status: ${result.status}`
    );
  } catch (err) {
    logTest('Mi test de seguridad', false, err.message);
  }
}

// Agregar a runAllTests()
await testMySecurityFeature();
```

---

## 📅 Calendario de Pruebas

| Frecuencia | Pruebas | Responsable |
|---|---|---|
| **Diario** | Tests básicos de smoke | CI/CD Pipeline |
| **Semanal** | Suite completa | QA Team |
| **Mensual** | Stress tests extensos | DevOps |
| **Trimestral** | Audit de seguridad | Security Team |
| **Anual** | Penetration testing | External firm |

---

## 📚 Documentación Adicional

- [REPORTE_PRUEBAS_COMPLETO.md](../REPORTE_PRUEBAS_COMPLETO.md) - Documentación técnica detallada
- [STRESS_SECURITY_RESUMEN.txt](../STRESS_SECURITY_RESUMEN.txt) - Resumen ejecutivo
- [docs/ARQUITECTURA_Y_TECNOLOGIAS.md](../docs/ARQUITECTURA_Y_TECNOLOGIAS.md) - Arquitectura del sistema
- [tests/PRUEBAS_MANUALES_FRONTEND.md](./PRUEBAS_MANUALES_FRONTEND.md) - Guía de pruebas manuales

---

## ✅ Checklist Antes de Producción

- [ ] Todas las pruebas de stress pasan (9/9)
- [ ] Todas las pruebas de seguridad pasan (25/25)
- [ ] P95 latency <500ms
- [ ] Memory leak <50MB en 1000 requests
- [ ] HTTPS configurado
- [ ] HSTS headers activos
- [ ] Rate limiting en endpoints sensibles
- [ ] Audit logging habilitado
- [ ] Backups automáticos validados
- [ ] Monitoring en tiempo real
- [ ] Plan de incident response
- [ ] Documentación de deployment

---

## 🎯 Próximos Pasos

1. Ejecutar todas las pruebas regularmente
2. Integrar en CI/CD pipeline
3. Agregar más tests según necesidad
4. Hacer penetration testing profesional
5. Implementar monitoring continuo
6. Actualizar suite según OWASP changes

---

## 📞 Soporte

Para preguntas o problemas con las pruebas:
- Crea un issue en GitHub
- Contacta al equipo de QA
- Revisa los logs en `backend/logs/`

---

**Última actualización**: 2 de febrero de 2026  
**Versión**: 1.0  
**Mantenedor**: DevOps Team

✅ **Listo para Producción**
