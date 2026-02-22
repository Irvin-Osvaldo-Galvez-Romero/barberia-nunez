# 🔄 Flujos N8N - Sistema de Barbería

Esta guía contiene todos los flujos de automatización para tu sistema de barbería usando n8n.

## 📋 Índice de Flujos

1. [CRUD con Google Calendar Sync](#1-crud-con-google-calendar-sync)
2. [Recordatorios Automáticos](#2-recordatorios-automáticos)
3. [Reportes Automáticos](#3-reportes-automáticos)
4. [Backup Automático](#4-backup-automático)

---

## 🔧 Configuración Inicial en n8n

### Credenciales necesarias:

#### 1. Supabase
```
URL: https://volelarivkbmikhdqolo.supabase.co
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGVsYXJpdmtibWlraGRxb2xvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODA5NjM4MCwiZXhwIjoyMDgzNjcyMzgwfQ.C4luFyPIdedIlqG7YqkUPtuwTo366o98gzIXr1OXbXU
```

#### 2. Google OAuth2
```
Client ID: 798933263376-o4gg244i5sud1kokj5pu1fhb442dhcce.apps.googleusercontent.com
Client Secret: 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
```

#### 3. Gmail (para enviar correos)
```
Refresh Token: 1//0fG2UqDTBt3BuCgYIARAAGA8SNwF-L9Ir0KGP_iOjrBeyQoVIVwD4z70uGDcpNkza_zDtaHp6FV7onSDbaGBgPrF4gxGig4z85ZE
Email: nunezbarbershopp@gmail.com
```

---

## Cómo importar los flujos:

1. Abre n8n
2. Click en "**+ Add workflow**"
3. Click en los tres puntos (⋮) arriba a la derecha
4. Selecciona "**Import from File...**" o "**Import from URL...**"
5. Pega el JSON del flujo
6. Configura las credenciales
7. Activa el flujo

---

## 1. CRUD con Google Calendar Sync

**Propósito:** Webhook que recibe operaciones CRUD y las sincroniza automáticamente con Supabase y Google Calendar.

### Endpoints disponibles:

```
POST /webhook/cita/crear      - Crear cita (sync Google Calendar)
PUT  /webhook/cita/actualizar - Actualizar cita (sync Google Calendar)
DELETE /webhook/cita/eliminar - Eliminar cita (sync Google Calendar)

POST /webhook/empleado/crear
PUT  /webhook/empleado/actualizar
DELETE /webhook/empleado/eliminar

POST /webhook/cliente/crear
PUT  /webhook/cliente/actualizar

POST /webhook/servicio/crear
PUT  /webhook/servicio/actualizar
```

### Ejemplo de uso (Crear cita):

```bash
curl -X POST https://tu-n8n.com/webhook/cita/crear \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "uuid-del-cliente",
    "barbero_id": "uuid-del-barbero",
    "fecha_hora": "2026-02-20T10:00:00Z",
    "duracion": 60,
    "servicios": ["uuid-servicio-1", "uuid-servicio-2"],
    "notas": "Cliente prefiere corte degradado"
  }'
```

**Archivo:** [flujo-1-crud-google-sync.json](flujo-1-crud-google-sync.json)

---

## 2. Recordatorios Automáticos

**Propósito:** Envía recordatorios automáticos de citas por email/WhatsApp.

### Configuración:

- **24 horas antes:** Email de recordatorio
- **1 hora antes:** Email/SMS urgente

### Triggers:

- Se ejecuta cada 15 minutos
- Busca citas próximas
- Envía solo una vez por cita

### Contenido del recordatorio:

```
Hola [CLIENTE],

Te recordamos tu cita en [BARBERÍA]:

📅 Fecha: [FECHA]
🕐 Hora: [HORA]
💈 Barbero: [NOMBRE_BARBERO]
✂️ Servicios: [LISTA_SERVICIOS]

¡Te esperamos!
```

**Archivo:** [flujo-2-recordatorios.json](flujo-2-recordatorios.json)

---

## 3. Reportes Automáticos

**Propósito:** Genera y envía reportes automáticos de estadísticas.

### Reportes disponibles:

#### 📊 Reporte Diario (9:00 PM todos los días)
- Total de citas del día
- Ingresos del día
- Servicios más solicitados
- Barberos más activos

#### 📈 Reporte Semanal (Lunes 8:00 AM)
- Resumen de la semana anterior
- Comparación con semana previa
- Top 5 clientes
- Top 5 servicios
- Gráficas de tendencias

### Ejemplo de reporte:

```
📊 REPORTE DIARIO - 19 Feb 2026

Citas realizadas: 15
Ingresos totales: $1,250 MXN
Promedio por cita: $83.33

Top Servicios:
1. Corte degradado (8 veces)
2. Barba (6 veces)
3. Tinte (1 vez)

Top Barberos:
1. Juan Pérez - 8 citas
2. Carlos López - 7 citas
```

**Archivo:** [flujo-3-reportes.json](flujo-3-reportes.json)

---

## 4. Backup Automático

**Propósito:** Exporta la base de datos y la envía por email/Google Drive.

### Configuración:

- **Frecuencia:** Todos los días a las 2:00 AM
- **Formato:** JSON comprimido (.zip)
- **Destino:** Email del administrador + Google Drive (opcional)

### Tablas respaldadas:

- ✅ citas
- ✅ clientes
- ✅ empleados
- ✅ servicios
- ✅ servicios_citas
- ✅ horarios_negocio
- ✅ configuracion_general
- ✅ google_tokens (encriptado)

### Retención:

- Los últimos 7 backups se mantienen
- Backups más antiguos se eliminan automáticamente

**Archivo:** [flujo-4-backup.json](flujo-4-backup.json)

---

## 📚 Estructura de los flujos

```
n8n/
├── README_N8N.md                    (esta guía)
├── flujo-1-crud-google-sync.json   (CRUD + Google Calendar)
├── flujo-2-recordatorios.json       (Recordatorios automáticos)
├── flujo-3-reportes.json            (Reportes diarios/semanales)
└── flujo-4-backup.json              (Backup automático)
```

---

## 🚀 Próximos pasos

1. **Instalar n8n** (si no lo tienes):
   ```bash
   npm install -g n8n
   n8n start
   ```

2. **Configurar credenciales** en n8n:
   - Supabase
   - Google OAuth2
   - Gmail (para emails)

3. **Importar los 4 flujos**

4. **Activar cada flujo** uno por uno

5. **Probar con datos de prueba**

---

## ⚙️ Configuración avanzada

### Variables de entorno para n8n:

```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=tu_password_seguro
N8N_WEBHOOK_URL=https://tu-dominio.com
N8N_PORT=5678
```

### WhatsApp (opcional):

Si quieres enviar recordatorios por WhatsApp, necesitas:
- Cuenta de Twilio o WhatsApp Business API
- Agregar credencial de Twilio en n8n
- Actualizar el flujo 2 con nodo de WhatsApp

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica que las credenciales estén correctas
2. Revisa los logs del flujo en n8n
3. Asegúrate que Supabase esté accesible
4. Verifica que Google Calendar API esté habilitada

---

## 📝 Notas importantes

⚠️ **Seguridad:**
- Los webhooks están abiertos por ahora
- En producción, agrega autenticación (API Key o JWT)
- Usa HTTPS siempre

⚠️ **Rate Limits:**
- Google Calendar API: 1M requests/día
- Gmail API: 1B queries/día
- Supabase: según tu plan

⚠️ **Costos:**
- n8n self-hosted: Gratis
- n8n Cloud: Desde $20/mes
- Google APIs: Gratis (dentro de límites)

