-- ============================================================
-- Barber Loyalty SaaS — Schema multi-tenant
-- ============================================================

-- Barberías (tenants)
create table if not exists shops (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  slug            text not null unique,          -- para URL amigable
  logo_url        text,
  color_primario  text not null default '#1a1a2e',
  email_admin     text not null,
  telefono        text,
  direccion       text,
  plan            text not null default 'trial', -- trial | active | cancelled
  trial_ends_at   timestamptz not null default (now() + interval '14 days'),
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Usuarios por barbería (owner o staff)
create table if not exists shop_users (
  id        uuid primary key default gen_random_uuid(),
  shop_id   uuid not null references shops(id) on delete cascade,
  user_id   uuid not null,                       -- Supabase auth.users
  role      text not null default 'owner',       -- owner | staff
  created_at timestamptz not null default now(),
  unique(shop_id, user_id)
);

-- Premios configurables por tarjeta (por barbería)
create table if not exists rewards_config (
  id            uuid primary key default gen_random_uuid(),
  shop_id       uuid not null references shops(id) on delete cascade,
  tarjeta_num   int not null,
  premio_texto  text not null,
  es_default    boolean not null default false,
  activo        boolean not null default true,
  created_at    timestamptz not null default now(),
  unique(shop_id, tarjeta_num)
);

-- Solo un premio default activo por barbería
create unique index if not exists rewards_one_default_per_shop
  on rewards_config (shop_id, es_default) where es_default = true;

-- Clientes (por barbería — el mismo DNI puede estar en varias barberías)
create table if not exists clients (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references shops(id) on delete cascade,
  dni_ce      text not null,
  nombre      text not null,
  email       text not null,
  telefono    text,
  created_at  timestamptz not null default now(),
  unique(shop_id, dni_ce)
);

create index if not exists clients_shop_nombre_idx on clients (shop_id, lower(nombre));

-- Tarjetas de fidelidad (1 por cliente por barbería)
create table if not exists loyalty_cards (
  id                  uuid primary key default gen_random_uuid(),
  shop_id             uuid not null references shops(id) on delete cascade,
  client_id           uuid not null unique references clients(id) on delete cascade,
  visitas_actuales    int not null default 0 check (visitas_actuales between 0 and 10),
  tarjetas_completas  int not null default 0 check (tarjetas_completas >= 0),
  premio_pendiente    boolean not null default false,
  premio_texto        text,
  updated_at          timestamptz not null default now()
);

-- Historial de visitas
create table if not exists visits (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references shops(id) on delete cascade,
  client_id       uuid not null references clients(id) on delete cascade,
  fecha           timestamptz not null default now(),
  premio_aplicado text
);

create index if not exists visits_shop_client_idx on visits (shop_id, client_id, fecha desc);

-- ============================================================
-- RLS — cada usuario solo ve datos de su barbería
-- ============================================================
alter table shops         enable row level security;
alter table shop_users    enable row level security;
alter table rewards_config enable row level security;
alter table clients       enable row level security;
alter table loyalty_cards enable row level security;
alter table visits        enable row level security;

-- shops: ver y editar solo las tuyas
create policy "shop_owner_access" on shops
  for all to authenticated
  using (id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (id in (select shop_id from shop_users where user_id = auth.uid()));

-- shop_users: ver solo tu barbería
create policy "shop_users_access" on shop_users
  for all to authenticated
  using (shop_id in (select shop_id from shop_users where user_id = auth.uid()));

-- rewards_config, clients, loyalty_cards, visits: idem
create policy "shop_data_access" on rewards_config
  for all to authenticated
  using (shop_id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (shop_id in (select shop_id from shop_users where user_id = auth.uid()));

create policy "shop_data_access" on clients
  for all to authenticated
  using (shop_id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (shop_id in (select shop_id from shop_users where user_id = auth.uid()));

create policy "shop_data_access" on loyalty_cards
  for all to authenticated
  using (shop_id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (shop_id in (select shop_id from shop_users where user_id = auth.uid()));

create policy "shop_data_access" on visits
  for all to authenticated
  using (shop_id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (shop_id in (select shop_id from shop_users where user_id = auth.uid()));

-- ============================================================
-- Helpers
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_shops_updated_at
  before update on shops for each row execute function set_updated_at();

create trigger trg_cards_updated_at
  before update on loyalty_cards for each row execute function set_updated_at();

-- Función: obtener shop_id del usuario autenticado
create or replace function get_my_shop_id()
returns uuid language sql stable as $$
  select shop_id from shop_users where user_id = auth.uid() limit 1;
$$;
