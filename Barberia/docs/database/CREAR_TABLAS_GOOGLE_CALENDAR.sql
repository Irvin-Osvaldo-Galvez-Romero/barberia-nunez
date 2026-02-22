-- =====================================================
-- TABLAS PARA INTEGRACIÓN CON GOOGLE CALENDAR
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor
-- Estas tablas NO modifican empleados ni citas
-- =====================================================

-- 1) TABLA: google_tokens
-- Almacena los tokens OAuth2 de cada barbero para Google Calendar
-- =====================================================

create table if not exists google_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references empleados(id) on delete cascade,
  provider text not null default 'google',
  access_token text,
  refresh_token text,
  token_type text default 'Bearer',
  scope text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índice único: un barbero puede tener solo un registro por proveedor
create unique index if not exists google_tokens_user_provider_uk
  on google_tokens(user_id, provider);

-- Índice para búsquedas por user_id
create index if not exists google_tokens_user_id_idx
  on google_tokens(user_id);

comment on table google_tokens is 'Tokens OAuth2 de Google Calendar por barbero';
comment on column google_tokens.user_id is 'Referencia al empleado/barbero dueño del token';
comment on column google_tokens.access_token is 'Token de acceso (expira cada ~1h)';
comment on column google_tokens.refresh_token is 'Token para renovar access_token';
comment on column google_tokens.expires_at is 'Fecha de expiración del access_token';

-- =====================================================
-- 2) TABLA: google_events
-- Registra qué citas se sincronizaron con Google Calendar
-- Evita duplicados y permite actualizar/borrar eventos
-- =====================================================

create table if not exists google_events (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid not null references citas(id) on delete cascade,
  user_id uuid not null references empleados(id) on delete cascade,
  calendar_id text not null default 'primary',
  event_id text not null,              -- ID del evento en Google Calendar
  status text default 'confirmed',     -- confirmed, cancelled, etc.
  synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_error text                      -- Para debug si falla sync/update
);

-- Índice único: cada cita solo se sincroniza una vez por barbero
create unique index if not exists google_events_cita_user_uk
  on google_events(cita_id, user_id);

-- Índice por user_id para consultas rápidas
create index if not exists google_events_user_id_idx
  on google_events(user_id);

-- Índice por cita_id
create index if not exists google_events_cita_id_idx
  on google_events(cita_id);

comment on table google_events is 'Registro de eventos sincronizados con Google Calendar';
comment on column google_events.cita_id is 'Referencia a la cita sincronizada';
comment on column google_events.user_id is 'Barbero que sincronizó (dueño del calendar)';
comment on column google_events.event_id is 'ID del evento en Google Calendar API';
comment on column google_events.last_error is 'Último error al sincronizar (si aplica)';

-- =====================================================
-- 3) HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

alter table google_tokens enable row level security;
alter table google_events enable row level security;

-- =====================================================
-- 4) POLÍTICAS RLS PARA google_tokens
-- =====================================================
-- Roles permitidos: BARBERO (dueño), ADMIN, RECEPCIONISTA (solo lectura/ayuda)
-- =====================================================

-- SELECT: Barbero ve su token, Admin/Recepcionista pueden ver todos
create policy "tokens_select_owner_or_staff"
on google_tokens
for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from empleados e
    where e.id = auth.uid() 
    and e.rol in ('ADMIN', 'RECEPCIONISTA')
  )
);

-- INSERT: Solo el dueño (barbero) puede crear su token, o Admin
create policy "tokens_insert_owner_or_admin"
on google_tokens
for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1 from empleados e
    where e.id = auth.uid() and e.rol = 'ADMIN'
  )
);

-- UPDATE: Solo el dueño o Admin pueden actualizar (refresh tokens)
create policy "tokens_update_owner_or_admin"
on google_tokens
for update
using (
  auth.uid() = user_id
  or exists (
    select 1 from empleados e
    where e.id = auth.uid() and e.rol = 'ADMIN'
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1 from empleados e
    where e.id = auth.uid() and e.rol = 'ADMIN'
  )
);

-- DELETE: Solo el dueño o Admin pueden desconectar
create policy "tokens_delete_owner_or_admin"
on google_tokens
for delete
using (
  auth.uid() = user_id
  or exists (
    select 1 from empleados e
    where e.id = auth.uid() and e.rol = 'ADMIN'
  )
);

-- =====================================================
-- 5) POLÍTICAS RLS PARA google_events
-- =====================================================
-- Roles: BARBERO (dueño), ADMIN, RECEPCIONISTA (lectura)
-- =====================================================

-- SELECT: Barbero ve sus eventos, Admin/Recepcionista pueden ver todos
create policy "events_select_owner_or_staff"
on google_events
for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from empleados e
    where e.id = auth.uid() 
    and e.rol in ('ADMIN', 'RECEPCIONISTA')
  )
);

-- INSERT: Solo el dueño (barbero) o Admin pueden crear eventos
create policy "events_insert_owner_or_admin"
on google_events
for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1 from empleados e
    where e.id = auth.uid() and e.rol = 'ADMIN'
  )
);

-- UPDATE: Solo el dueño o Admin pueden actualizar status/errores
create policy "events_update_owner_or_admin"
on google_events
for update
using (
  auth.uid() = user_id
  or exists (
    select 1 from empleados e
    where e.id = auth.uid() and e.rol = 'ADMIN'
  )
)
with check (
  user_id = user_id  -- Evitar cambiar el dueño
  and (
    auth.uid() = user_id
    or exists (
      select 1 from empleados e
      where e.id = auth.uid() and e.rol = 'ADMIN'
    )
  )
);

-- DELETE: Solo el dueño o Admin pueden borrar eventos
create policy "events_delete_owner_or_admin"
on google_events
for delete
using (
  auth.uid() = user_id
  or exists (
    select 1 from empleados e
    where e.id = auth.uid() and e.rol = 'ADMIN'
  )
);

-- =====================================================
-- 6) FUNCIÓN AUXILIAR: actualizar updated_at automáticamente
-- =====================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para ambas tablas
create trigger update_google_tokens_updated_at
before update on google_tokens
for each row
execute function update_updated_at_column();

create trigger update_google_events_updated_at
before update on google_events
for each row
execute function update_updated_at_column();

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================
-- Ahora tienes:
-- ✅ Tabla google_tokens (tokens OAuth por barbero)
-- ✅ Tabla google_events (registro de eventos sincronizados)
-- ✅ RLS habilitado con políticas para BARBERO, ADMIN, RECEPCIONISTA
-- ✅ Triggers para actualizar updated_at automáticamente
-- ✅ Índices para optimizar consultas
--
-- Siguiente paso:
-- 1) Ejecuta este script en Supabase SQL Editor
-- 2) Configura tu backend para:
--    - POST /api/google/auth-url (devuelve URL OAuth)
--    - GET /api/google/callback (guarda tokens en google_tokens)
--    - POST /api/google/sync (sincroniza citas, registra en google_events)
-- 3) En el front, conecta el botón "Conectar Google Calendar" al endpoint auth-url
-- =====================================================
