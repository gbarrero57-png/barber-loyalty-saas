-- ============================================================
-- Sprint 2 — Barberos, Servicios, Citas
-- ============================================================

-- Barberos por barbería
create table if not exists barbers (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references shops(id) on delete cascade,
  nombre      text not null,
  telefono    text,
  email       text,
  foto_url    text,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists barbers_shop_idx on barbers (shop_id);

-- Catálogo de servicios por barbería
create table if not exists services (
  id           uuid primary key default gen_random_uuid(),
  shop_id      uuid not null references shops(id) on delete cascade,
  nombre       text not null,
  descripcion  text,
  precio       numeric(10,2) not null default 0,
  duracion_min int not null default 30,   -- minutos estimados
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists services_shop_idx on services (shop_id);

-- Citas / Agenda
create table if not exists appointments (
  id           uuid primary key default gen_random_uuid(),
  shop_id      uuid not null references shops(id) on delete cascade,
  barber_id    uuid references barbers(id) on delete set null,
  client_id    uuid references clients(id) on delete set null,
  service_id   uuid references services(id) on delete set null,
  -- cliente sin cuenta registrada
  client_nombre text,
  client_tel    text,
  fecha_inicio  timestamptz not null,
  fecha_fin     timestamptz,
  estado        text not null default 'pendiente',  -- pendiente | confirmado | completado | cancelado
  notas         text,
  precio        numeric(10,2),
  created_at    timestamptz not null default now()
);

create index if not exists appointments_shop_fecha_idx on appointments (shop_id, fecha_inicio);
create index if not exists appointments_barber_fecha_idx on appointments (barber_id, fecha_inicio);

-- ============================================================
-- RLS
-- ============================================================
alter table barbers       enable row level security;
alter table services      enable row level security;
alter table appointments  enable row level security;

create policy "shop_data_access" on barbers
  for all to authenticated
  using (shop_id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (shop_id in (select shop_id from shop_users where user_id = auth.uid()));

create policy "shop_data_access" on services
  for all to authenticated
  using (shop_id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (shop_id in (select shop_id from shop_users where user_id = auth.uid()));

create policy "shop_data_access" on appointments
  for all to authenticated
  using (shop_id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (shop_id in (select shop_id from shop_users where user_id = auth.uid()));
