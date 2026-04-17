-- Sprint 5 — Horarios y sesiones del bot WhatsApp

-- Horarios de trabajo por barbero (o default de la barbería)
create table if not exists barber_schedules (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references shops(id) on delete cascade,
  barber_id   uuid references barbers(id) on delete cascade,  -- null = horario default de la barbería
  dia_semana  int not null check (dia_semana between 0 and 6), -- 0=Dom 1=Lun ... 6=Sab
  hora_inicio time not null default '09:00',
  hora_fin    time not null default '18:00',
  activo      boolean not null default true
);

create index if not exists schedules_shop_barber_idx on barber_schedules (shop_id, barber_id, dia_semana);

-- Sesiones de conversación del bot (estado por número de teléfono + barbería)
create table if not exists bot_sessions (
  phone      text not null,
  shop_id    uuid not null references shops(id) on delete cascade,
  state      text not null default 'menu',
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (phone, shop_id)
);

-- Número Twilio por barbería (para ruteo del bot)
alter table shops
  add column if not exists bot_twilio_number text;   -- ej: +13186683828
alter table shops
  add column if not exists bot_enabled boolean not null default false;

-- RLS
alter table barber_schedules enable row level security;
alter table bot_sessions      enable row level security;

create policy "shop_data_access" on barber_schedules
  for all to authenticated
  using  (shop_id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (shop_id in (select shop_id from shop_users where user_id = auth.uid()));

-- bot_sessions: solo el service role (API bot) puede leer/escribir
create policy "service_role_only" on bot_sessions
  for all to service_role using (true) with check (true);
