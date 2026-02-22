╔════════════════════════════════════════════════════════════════════════════════╗
║                   🔍 CÓMO MONITOREAR TU BASE DE DATOS                           ║
╚════════════════════════════════════════════════════════════════════════════════╝

📊 HERRAMIENTAS DE MONITOREO EN SUPABASE
═══════════════════════════════════════════════════════════════════════════════

═ OPCIÓN 1: Dashboard de Supabase (Oficial) ═

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto "barberia"
3. Panel izquierdo → "Project Settings"
4. Verás:
   ├─ Storage: Espacio usado vs límite
   ├─ Bandwidth: Datos descargados este mes
   ├─ Database connections: Conexiones activas
   └─ Row count: Cantidad de registros por tabla

VER ESPACIO USADO:
  1. Settings → Billing → Usage
  2. Verás un gráfico con:
     ├─ Database storage (MB)
     ├─ File storage (MB)
     ├─ Bandwidth (GB)
     └─ Monthly bill ($)

═ OPCIÓN 2: SQL Editor (Query Builder) ═

En Supabase, ve a SQL Editor y ejecuta:

-- Ver espacio de todas las tablas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = schemaname AND table_name = tablename) AS row_count
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver cantidad de registros por tabla
SELECT 
  tablename,
  (SELECT COUNT(*) FROM public.clientes) as clientes_count,
  (SELECT COUNT(*) FROM public.citas) as citas_count,
  (SELECT COUNT(*) FROM public.empleados) as empleados_count,
  (SELECT COUNT(*) FROM public.servicios) as servicios_count
FROM pg_tables
WHERE schemaname = 'public' LIMIT 1;

-- Ver índices y su tamaño
SELECT 
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = indexname
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

═ OPCIÓN 3: Monitoreo Automatizado ═

Crear un script para verificar automáticamente:

```javascript
// monitorBD.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkDatabaseHealth() {
  console.log('🔍 Verificando salud de BD...')
  
  // Contar registros
  const { count: clientesCount } = await supabase
    .from('clientes').select('*', { count: 'exact' })
  
  const { count: citasCount } = await supabase
    .from('citas').select('*', { count: 'exact' })
  
  const { count: empleadosCount } = await supabase
    .from('empleados').select('*', { count: 'exact' })

  console.log(`Clientes: ${clientesCount}`)
  console.log(`Citas: ${citasCount}`)
  console.log(`Empleados: ${empleadosCount}`)
  
  // Alertas
  if (citasCount > 100000) {
    console.warn('⚠️ ALERTA: Más de 100,000 citas - Considera archiving')
  }
  if (clientesCount > 5000) {
    console.warn('⚠️ ALERTA: Más de 5,000 clientes - Upgrade a Pro recomendado')
  }
}

checkDatabaseHealth()
```

═══════════════════════════════════════════════════════════════════════════════

📈 MÉTRICAS A MONITOREAR
═══════════════════════════════════════════════════════════════════════════════

ALMACENAMIENTO:
  Verde (✅):  < 250 MB
  Amarillo (⚠️): 250-450 MB
  Rojo (❌):    > 450 MB

CANTIDAD DE REGISTROS (Citas):
  Verde (✅):  < 50,000
  Amarillo (⚠️): 50,000-200,000
  Rojo (❌):    > 200,000

CANTIDAD DE CLIENTES:
  Verde (✅):  < 3,000
  Amarillo (⚠️): 3,000-5,000
  Rojo (❌):    > 5,000

ANCHO DE BANDA (mensual):
  Verde (✅):  < 40 GB
  Amarillo (⚠️): 40-48 GB
  Rojo (❌):    > 50 GB (límite)

CONEXIONES ACTIVAS:
  Verde (✅):  < 5
  Amarillo (⚠️): 5-8
  Rojo (❌):    > 10 (límite)

═══════════════════════════════════════════════════════════════════════════════

⚙️ OPTIMIZACIONES CUANDO CRECES
═══════════════════════════════════════════════════════════════════════════════

SI ALMACENAMIENTO > 400 MB:

1. Archiva citas antiguas (>1 año)
   ```sql
   -- Mover citas antiguas a tabla archive
   INSERT INTO citas_archive SELECT * FROM citas 
   WHERE fecha_hora < NOW() - INTERVAL '1 year';
   DELETE FROM citas WHERE fecha_hora < NOW() - INTERVAL '1 year';
   ```

2. Limpia google_events obsoletos
   ```sql
   DELETE FROM google_events WHERE synced_at < NOW() - INTERVAL '6 months';
   ```

3. Comprime datos de configuración
   ```sql
   -- Optimiza tablas
   VACUUM FULL;
   REINDEX DATABASE barberia;
   ```

SI CONSULTAS SON LENTAS:

1. Verifica análisis de plan:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM citas WHERE fecha_hora > NOW();
   ```

2. Agrega índices si es necesario:
   ```sql
   CREATE INDEX idx_citas_estado ON citas(estado) 
   WHERE estado != 'CANCELADA';
   ```

3. Usa CLUSTER para orden físico:
   ```sql
   CLUSTER citas USING idx_citas_fecha_hora;
   ```

═══════════════════════════════════════════════════════════════════════════════

🎯 CHECKLIST DE MONITOREO
═══════════════════════════════════════════════════════════════════════════════

SEMANAL:
  [ ] Verifica almacenamiento en Settings → Billing
  [ ] Comprueba que no hay errores en los logs
  [ ] Verifica que las citas se sincronizan a Google Calendar

MENSUAL:
  [ ] Ejecuta análisis de tamaño de tablas (SQL)
  [ ] Comprueba crecimiento vs plan
  [ ] Revisa si necesitas optimizaciones
  [ ] Limpia datos obsoletos si es necesario

TRIMESTRAL:
  [ ] Análisis de rendimiento con EXPLAIN ANALYZE
  [ ] Verifica índices innecesarios
  [ ] Revisa si necesitas upgrade de plan
  [ ] Backup manual de datos críticos

ANUAL:
  [ ] Revisión de arquitectura
  [ ] Auditoría de seguridad (RLS, etc)
  [ ] Evaluación de costos vs beneficios
  [ ] Planificación de escalamiento

═══════════════════════════════════════════════════════════════════════════════

🚨 ALERTAS AUTOMÁTICAS (Si pagas plan Pro+)
═══════════════════════════════════════════════════════════════════════════════

Con plan Pro o superior, puedes configurar alertas:

1. Settings → Monitoring
2. Configura alertas para:
   ├─ CPU > 80%
   ├─ Storage > 80%
   ├─ Bandwidth > 80%
   ├─ Conexiones > 8
   └─ Errores en base de datos

Recibirás emails cuando se alcancen estos límites.

═══════════════════════════════════════════════════════════════════════════════

💾 BACKUPS
═══════════════════════════════════════════════════════════════════════════════

AUTOMÁTICOS (Supabase):
  ├─ Diarios por 7 días
  ├─ Semanales por 4 semanas
  └─ Restaurables desde Dashboard

MANUAL (Recomendado):
  1. Exportar desde SQL Editor:
     ```bash
     pg_dump -h db.volelarivkbmikhdqolo.supabase.co \
     -U postgres barberia > backup_2026_02_02.sql
     ```
  
  2. Exportar clientes/citas como CSV:
     - SQL Editor → Select datos
     - "Download as CSV"
     - Guardar en local
  
  3. Hacer backup cada mes en Google Drive/Dropbox

═══════════════════════════════════════════════════════════════════════════════

🔐 SEGURIDAD DE DATOS
═══════════════════════════════════════════════════════════════════════════════

VERIFICAR RLS:
  1. Settings → Authentication → Policies
  2. Verifica que todas las tablas tienen RLS
  3. Policies deben proteger datos de otros usuarios

ENCRIPTACIÓN:
  ✅ En tránsito: HTTPS/TLS (automático)
  ✅ En reposo: Encrypted by Supabase (automático)
  ✅ Variables de entorno: Protegidas

AUDITORÍA:
  1. Ve a Logs en Supabase Dashboard
  2. Verifica queries sospechosas
  3. Busca intentos de acceso no autorizados

═══════════════════════════════════════════════════════════════════════════════

📞 SOPORTE Y LIMITES
═══════════════════════════════════════════════════════════════════════════════

LIMITS.COM:
  - Free Tier: Sin soporte premium
  - Pro Tier: Email support
  - Business: Chat + Phone support

Si necesitas ayuda:
  1. Abre ticket en supabase.com/dashboard
  2. O pregunta en Discord: discord.gg/supabase
  3. Documentación: supabase.com/docs

═══════════════════════════════════════════════════════════════════════════════

RESUMEN:
┌─ Monitorea almacenamiento y recordatorios
├─ Optimiza cuando sea necesario
├─ Haz backups regularmente
└─ Upgrade a Pro cuando lo necesites ($25/mes)

Tu sistema está listo para crecer de 0 a 1M de registros.
