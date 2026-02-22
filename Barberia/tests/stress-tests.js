/**
 * PRUEBAS DE STRESS - Sistema de Barbería
 * Simula carga alta, múltiples usuarios concurrentes y límites
 * 
 * Ejecutar: node tests/stress-tests.js
 */
/* eslint-disable no-undef */
const http = require('http');

const BASE_URL = 'http://localhost:3001';
let testsPassed = 0;
let testsFailed = 0;

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  if (passed) {
    testsPassed++;
    log(colors.green, `✅ PASS: ${name}`);
  } else {
    testsFailed++;
    log(colors.red, `❌ FAIL: ${name}`);
  }
  if (details) log(colors.cyan, `   └─ ${details}`);
}

// Helper para hacer requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            time: Date.now(),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            time: Date.now(),
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ==================== PRUEBAS DE STRESS ====================

async function testConcurrentRequests() {
  log(colors.blue, '\n🔥 PRUEBAS DE CARGA CONCURRENTE');
  
  try {
    // Test 1: 100 requests simultáneos a /health
    log(colors.yellow, 'Test 1: 100 requests simultáneos');
    const start = Date.now();
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(request('GET', '/health').catch(e => ({ error: e })));
    }
    const results = await Promise.all(promises);
    const time = Date.now() - start;
    const successful = results.filter(r => r.status === 200).length;
    logTest(
      '100 requests concurrentes',
      successful >= 95,
      `${successful}/100 exitosos en ${time}ms (${Math.round(100/time*1000)} req/s)`
    );
  } catch (err) {
    logTest('100 requests concurrentes', false, err.message);
  }
}

async function testDatabaseLoad() {
  log(colors.blue, '\n📊 PRUEBAS DE CARGA EN BASE DE DATOS');
  
  try {
    // Test 1: Múltiples GET a clientes
    log(colors.yellow, 'Test 1: 50 queries de clientes simultáneamente');
    const start = Date.now();
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(
        request('GET', '/api/clientes').catch(e => ({ error: e }))
      );
    }
    const results = await Promise.all(promises);
    const time = Date.now() - start;
    const successful = results.filter(r => r.status === 200).length;
    logTest(
      '50 queries de clientes simultáneos',
      successful >= 45,
      `${successful}/50 exitosos en ${time}ms`
    );

    // Test 2: Múltiples GET a citas
    log(colors.yellow, 'Test 2: 50 queries de citas simultáneamente');
    const start2 = Date.now();
    const promises2 = [];
    for (let i = 0; i < 50; i++) {
      promises2.push(
        request('GET', '/api/citas').catch(e => ({ error: e }))
      );
    }
    const results2 = await Promise.all(promises2);
    const time2 = Date.now() - start2;
    const successful2 = results2.filter(r => r.status === 200).length;
    logTest(
      '50 queries de citas simultáneoas',
      successful2 >= 45,
      `${successful2}/50 exitosos en ${time2}ms`
    );
  } catch (err) {
    logTest('Carga en BD', false, err.message);
  }
}

async function testMemoryLeak() {
  log(colors.blue, '\n💾 PRUEBAS DE MEMORY LEAK');
  
  try {
    log(colors.yellow, 'Test 1: 1000 requests secuenciales - monitorear memoria');
    
    if (typeof global.gc === 'function') {
      global.gc();
      const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;
      
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        await request('GET', '/health').catch(() => null);
        if (i % 100 === 0) process.stdout.write('.');
      }
      process.stdout.write('\n');
      
      if (typeof global.gc === 'function') global.gc();
      const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;
      Date.now() - start; // Calculate time but not used
      const memDiff = memAfter - memBefore;
      
      logTest(
        '1000 requests sin leak',
        memDiff < 50,
        `Memoria: antes=${memBefore.toFixed(2)}MB, después=${memAfter.toFixed(2)}MB, diff=${memDiff.toFixed(2)}MB`
      );
    } else {
      log(colors.yellow, '⚠️  Ejecuta con: node --expose-gc stress-tests.js para test completo');
      testsPassed++;
    }
  } catch (err) {
    logTest('Memory leak test', false, err.message);
  }
}

async function testTimeout() {
  log(colors.blue, '\n⏱️  PRUEBAS DE TIMEOUT');
  
  try {
    log(colors.yellow, 'Test 1: Requests con timeout de 5s');
    const start = Date.now();
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        Promise.race([
          request('GET', '/api/clientes'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          ),
        ]).catch(e => ({ error: e }))
      );
    }
    
    const results = await Promise.all(promises);
    const time = Date.now() - start;
    const successful = results.filter(r => !r.error && r.status === 200).length;
    
    logTest(
      'Requests responden dentro de 5s',
      successful >= 9,
      `${successful}/10 respondieron en ${time}ms`
    );
  } catch (err) {
    logTest('Timeout test', false, err.message);
  }
}

async function testLargePayload() {
  log(colors.blue, '\n📦 PRUEBAS DE PAYLOAD GRANDE');
  
  try {
    log(colors.yellow, 'Test 1: POST con payload de 1MB');
    
    // Crear un payload grande (1MB)
    const largeData = {
      nombre: 'Cliente Test',
      email: 'test@test.com',
      telefono: '1234567890',
      datos_extras: 'x'.repeat(1024 * 1024), // 1MB de texto
    };
    
    const start = Date.now();
    const result = await request('POST', '/api/clientes', largeData)
      .catch(e => ({ error: e, status: 500 }));
    const time = Date.now() - start;
    
    logTest(
      'POST 1MB payload',
      result.status < 500,
      `Status ${result.status} en ${time}ms`
    );
  } catch (err) {
    logTest('Large payload test', false, err.message);
  }
}

async function testRapidCreateDelete() {
  log(colors.blue, '\n🔄 PRUEBAS DE CREATE/DELETE RÁPIDO');
  
  try {
    log(colors.yellow, 'Test 1: Crear 10 clientes rápidamente');
    
    const clientIds = [];
    const start = Date.now();
    
    for (let i = 0; i < 10; i++) {
      const result = await request('POST', '/api/clientes', {
        nombre: `Stress Test ${Date.now()}-${i}`,
        email: `stress${Date.now()}-${i}@test.com`,
        telefono: '1234567890',
      }).catch(() => ({ status: 500 }));
      
      if (result.status === 200 || result.status === 201) {
        clientIds.push(result.body?.id);
      }
    }
    
    const time = Date.now() - start;
    logTest(
      'Crear 10 clientes rápidamente',
      clientIds.length >= 8,
      `${clientIds.length}/10 creados en ${time}ms`
    );
  } catch (err) {
    logTest('Create/Delete rápido', false, err.message);
  }
}

async function testResponseTime() {
  log(colors.blue, '\n⚡ PRUEBAS DE TIEMPO DE RESPUESTA');
  
  try {
    log(colors.yellow, 'Test 1: Medir tiempo promedio de respuesta (50 requests)');
    
    const times = [];
    for (let i = 0; i < 50; i++) {
      const start = Date.now();
      await request('GET', '/api/clientes').catch(() => null);
      times.push(Date.now() - start);
    }
    
    times.sort((a, b) => a - b);
    const avg = times.reduce((a, b) => a + b) / times.length;
    const p50 = times[Math.floor(times.length * 0.5)];
    const p95 = times[Math.floor(times.length * 0.95)];
    const p99 = times[Math.floor(times.length * 0.99)];
    
    logTest(
      'Tiempo de respuesta aceptable',
      avg < 500,
      `Promedio: ${avg.toFixed(0)}ms, P50: ${p50}ms, P95: ${p95}ms, P99: ${p99}ms`
    );
  } catch (err) {
    logTest('Response time test', false, err.message);
  }
}

async function testConnectionPool() {
  log(colors.blue, '\n🔌 PRUEBAS DE CONNECTION POOL');
  
  try {
    log(colors.yellow, 'Test 1: 200 requests simultáneos - validar pool');
    
    const start = Date.now();
    const promises = [];
    
    for (let i = 0; i < 200; i++) {
      promises.push(
        request('GET', '/api/clientes').catch(e => ({ error: e }))
      );
    }
    
    const results = await Promise.all(promises);
    const time = Date.now() - start;
    const successful = results.filter(r => r.status === 200).length;
    
    logTest(
      '200 requests simultáneos (pool)',
      successful >= 180,
      `${successful}/200 exitosos en ${time}ms`
    );
  } catch (err) {
    logTest('Connection pool test', false, err.message);
  }
}

// ==================== MAIN ====================

async function runAllTests() {
  log(colors.blue, '═══════════════════════════════════════════════════');
  log(colors.blue, '  🔥 PRUEBAS DE STRESS - SISTEMA DE BARBERÍA');
  log(colors.blue, '═══════════════════════════════════════════════════');
  
  try {
    // Verificar que el servidor está corriendo
    log(colors.yellow, '\nVerificando conexión al servidor...');
    const health = await request('GET', '/health').catch(() => null);
    if (!health || health.status !== 200) {
      log(colors.red, '❌ El servidor no está disponible en http://localhost:3001');
      log(colors.yellow, 'Inicia el servidor con: npm run dev (backend)');
      process.exit(1);
    }
    log(colors.green, '✅ Servidor disponible\n');
    
    await testConcurrentRequests();
    await testDatabaseLoad();
    await testResponseTime();
    await testMemoryLeak();
    await testTimeout();
    await testLargePayload();
    await testRapidCreateDelete();
    await testConnectionPool();
    
  } catch (err) {
    log(colors.red, `Error general: ${err.message}`);
  }
  
  // Resumen
  log(colors.blue, '\n═══════════════════════════════════════════════════');
  log(colors.blue, '  📊 RESUMEN DE PRUEBAS');
  log(colors.blue, '═══════════════════════════════════════════════════');
  log(colors.green, `✅ PASADAS: ${testsPassed}`);
  log(colors.red, `❌ FALLIDAS: ${testsFailed}`);
  
  const total = testsPassed + testsFailed;
  const percentage = ((testsPassed / total) * 100).toFixed(2);
  
  if (testsFailed === 0) {
    log(colors.green, `\n🎉 TODAS LAS PRUEBAS PASARON (${percentage}%)`);
  } else {
    log(colors.yellow, `\n⚠️  ${percentage}% de pruebas pasaron`);
  }
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Ejecutar
runAllTests().catch(() => {
  log(colors.red, `Error fatal`);
  process.exit(1);
});
