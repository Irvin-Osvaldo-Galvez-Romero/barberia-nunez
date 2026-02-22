# 🚀 Guía Rápida - Configurar n8n para Barbería

## ⏱️ Tiempo estimado: 30 minutos

---

## 📋 Pre-requisitos

✅ Node.js v18+ instalado  
✅ Cuenta de Supabase activa  
✅ Credenciales de Google OAuth configuradas  
✅ Gmail API habilitado  

---

## Paso 1: Instalar n8n (5 min)

### Opción A: Instalación global (recomendado para desarrollo)

```bash
npm install -g n8n
```

### Opción B: Docker (recomendado para producción)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Iniciar n8n:

```bash
n8n start
```

Abre: **http://localhost:5678**

---

## Paso 2: Crear Tablas en Supabase (3 min)

1. Ve a tu proyecto Supabase: https://volelarivkbmikhdqolo.supabase.co
2. Abre el **SQL Editor**
3. Copia y ejecuta el contenido de: `n8n/tablas-n8n.sql`

Esto creará:
- ✅ Tabla `recordatorios_enviados`
- ✅ Tabla `backup_logs` (opcional)

---

## Paso 3: Configurar Credenciales en n8n (10 min)

### 3.1 Credencial: Supabase (PostgreSQL)

1. En n8n, ve a: **Credentials** → **+ Add Credential**
2. Busca: **"Postgres"**
3. Completa:
   ```
   Host: db.volelarivkbmikhdqolo.supabase.co
   Database: postgres
   User: postgres
   Password: [Tu password de Supabase]
   Port: 5432
   SSL: ✅ Enabled
   ```
4. Guarda como: **"Supabase"**

#### Cómo obtener la password:
- Ve a Supabase → Settings → Database → Database Password
- Si no la tienes, resetéala desde ahí

---

### 3.2 Credencial: Google Calendar

1. En n8n: **Credentials** → **+ Add Credential**
2. Busca: **"Google Calendar OAuth2 API"**
3. Completa:
   ```
   Client ID: 798933263376-o4gg244i5sud1kokj5pu1fhb442dhcce.apps.googleusercontent.com
   Client Secret: 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
   ```
4. Click en **"Connect my account"**
5. Autoriza con tu cuenta de Google
6. Guarda como: **"Google Calendar"**

---

### 3.3 Credencial: Gmail (para enviar correos)

1. En n8n: **Credentials** → **+ Add Credential**
2. Busca: **"Gmail OAuth2 API"**
3. Completa:
   ```
   Client ID: 798933263376-o4gg244i5sud1kokj5pu1fhb442dhcce.apps.googleusercontent.com
   Client Secret: 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
   ```
4. Click en **"Connect my account"**
5. Autoriza con: **nunezbarbershopp@gmail.com**
6. Guarda como: **"Gmail"**

---

## Paso 4: Importar los 4 Flujos (5 min)

### 4.1 Flujo 1: CRUD con Google Calendar

1. En n8n, click: **+ Add workflow**
2. Click en los tres puntos (⋮) arriba a la derecha
3. Selecciona: **"Import from File..."**
4. Selecciona: `n8n/flujo-1-crud-google-sync.json`
5. Asigna credenciales:
   - Nodos de Postgres → **"Supabase"**
   - Nodo Google Calendar → **"Google Calendar"**
6. Guarda el flujo
7. **Activa** el flujo (toggle arriba a la derecha)

### 4.2 Flujo 2: Recordatorios Automáticos

1. Importa: `n8n/flujo-2-recordatorios.json`
2. Asigna credenciales:
   - Nodos de Postgres → **"Supabase"**
   - Nodos de Gmail → **"Gmail"**
3. **Activa** el flujo

### 4.3 Flujo 3: Reportes Automáticos

1. Importa: `n8n/flujo-3-reportes.json`
2. Asigna credenciales:
   - Nodos de Postgres → **"Supabase"**
   - Nodos de Gmail → **"Gmail"**
3. **Activa** el flujo

### 4.4 Flujo 4: Backup Automático

1. Importa: `n8n/flujo-4-backup.json`
2. Asigna credenciales:
   - Nodos de Postgres → **"Supabase"**
   - Nodo de Gmail → **"Gmail"**
3. **Activa** el flujo

---

## Paso 5: Probar los Flujos (5 min)

### Probar Flujo 1 (CRUD):

Obtén la URL del webhook:

1. Abre el flujo 1
2. Click en el nodo **"Webhook - Crear Cita"**
3. Copia la **Production URL**

Prueba con curl:

```bash
curl -X POST https://tu-n8n.com/webhook/cita/crear \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "UUID_DEL_CLIENTE",
    "barbero_id": "UUID_DEL_BARBERO",
    "fecha_hora": "2026-02-20T10:00:00Z",
    "duracion": 60,
    "servicios": ["UUID_SERVICIO"],
    "notas": "Prueba desde n8n"
  }'
```

✅ Debe crear la cita en Supabase y en Google Calendar

---

### Probar Flujo 2 (Recordatorios):

1. Crea una cita en Supabase para **mañana a esta misma hora**
2. Espera 15 minutos
3. Revisa el inbox del cliente → debe llegar recordatorio

✅ Alternativamente, edita el Cron para que se ejecute cada 1 minuto durante la prueba

---

### Probar Flujo 3 (Reportes):

#### Opción A: Forzar ejecución manual
1. Abre el flujo 3
2. Click en el nodo **"Cron - Diario 9:00 PM"**
3. Click en **"Execute Node"**
4. Revisa tu email de administrador

#### Opción B: Cambiar horario temporalmente
1. Edita el Cron para que se ejecute en 5 minutos
2. Espera
3. Revisa email

---

### Probar Flujo 4 (Backup):

1. Abre el flujo 4
2. Click en **"Cron - Diario 2:00 AM"**
3. Click en **"Execute Node"**
4. Revisa tu email → debe llegar el backup adjunto

---

## 🎯 URLs de Webhooks (Flujo 1)

Una vez activados, tus endpoints serán:

```
POST   https://tu-n8n.com/webhook/cita/crear
PUT    https://tu-n8n.com/webhook/cita/actualizar
DELETE https://tu-n8n.com/webhook/cita/eliminar/:id

POST   https://tu-n8n.com/webhook/empleado/crear
PUT    https://tu-n8n.com/webhook/empleado/actualizar

POST   https://tu-n8n.com/webhook/cliente/crear
PUT    https://tu-n8n.com/webhook/cliente/actualizar

POST   https://tu-n8n.com/webhook/servicio/crear
PUT    https://tu-n8n.com/webhook/servicio/actualizar
```

Puedes usarlos desde tu frontend o app desktop.

---

## 🔐 Seguridad (Recomendaciones)

### Para Producción:

1. **Habilitar autenticación básica:**
   ```bash
   export N8N_BASIC_AUTH_ACTIVE=true
   export N8N_BASIC_AUTH_USER=admin
   export N8N_BASIC_AUTH_PASSWORD=tu_password_seguro
   ```

2. **Usar HTTPS:**
   - Despliega en servicio con SSL (Railway, Render, DigitalOcean)
   - O usa Cloudflare Tunnel

3. **Agregar API Key a webhooks:**
   - Edita cada webhook
   - Agrega nodo de validación con IF
   - Verifica header `X-API-Key`

4. **Limitar IPs permitidas:**
   - En tu firewall/proxy
   - Solo permite IPs conocidas

---

## 📊 Monitoreo

### Ver ejecuciones:

1. En n8n: **Executions** (menú lateral)
2. Revisa exitosos/fallidos
3. Click en cualquiera para ver logs detallados

### Logs en terminal:

```bash
n8n start --log-level debug
```

---

## ⚙️ Variables de entorno (Producción)

Crea archivo `.env`:

```env
# N8N Config
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=PasswordSeguro123!

# URL pública
N8N_WEBHOOK_URL=https://tu-dominio.com

# Puerto
N8N_PORT=5678

# Persistencia
N8N_USER_FOLDER=/home/node/.n8n

# Timezone
GENERIC_TIMEZONE=America/Mexico_City

# Logs
N8N_LOG_LEVEL=info
N8N_LOG_OUTPUT=console,file
```

Inicio con variables:

```bash
source .env
n8n start
```

---

## 🐳 Despliegue con Docker

### docker-compose.yml:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=PasswordSeguro123!
      - N8N_WEBHOOK_URL=https://tu-dominio.com
      - GENERIC_TIMEZONE=America/Mexico_City
    volumes:
      - ~/.n8n:/home/node/.n8n
```

Iniciar:

```bash
docker-compose up -d
```

---

## ❓ Troubleshooting

### Error: "No credentials configured"

**Solución:** Revisa que asignaste las credenciales en cada nodo

---

### Error: "Connection to database failed"

**Solución:**
1. Verifica que el host sea: `db.volelarivkbmikhdqolo.supabase.co`
2. Verifica que SSL esté habilitado
3. Prueba la conexión desde Supabase Dashboard

---

### Error: "Gmail API quota exceeded"

**Solución:**
- Gmail tiene límite de 500 emails/día (cuenta gratuita)
- Usa Brevo/SendGrid si necesitas más

---

### Los recordatorios no se envían

**Solución:**
1. Verifica que la tabla `recordatorios_enviados` exista
2. Revisa que el Cron esté activo
3. Asegúrate que hay citas futuras en la BD
4. Revisa logs de ejecución en n8n

---

## 📚 Recursos

- [Documentación n8n](https://docs.n8n.io)
- [Nodos de Postgres](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/)
- [Nodos de Google Calendar](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/)
- [Webhooks](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

---

## ✅ Checklist Final

- [ ] n8n instalado y corriendo
- [ ] Tablas `recordatorios_enviados` y `backup_logs` creadas
- [ ] Credencial Supabase configurada
- [ ] Credencial Google Calendar configurada
- [ ] Credencial Gmail configurada
- [ ] Flujo 1 importado y activado
- [ ] Flujo 2 importado y activado
- [ ] Flujo 3 importado y activado
- [ ] Flujo 4 importado y activado
- [ ] Webhook de crear cita probado exitosamente
- [ ] Recordatorio de prueba enviado
- [ ] Reporte de prueba recibido
- [ ] Backup de prueba recibido

---

¡Listo! Tu sistema de automatización está funcionando 🎉
