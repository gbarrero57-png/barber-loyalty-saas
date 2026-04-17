-- ============================================================
-- Sprint 1: Subscriptions + SuperAdmin
-- ============================================================

-- Actualizar enum de plan en shops para incluir phase1/phase2
-- (El campo ya existe como text, solo cambiamos los valores usados)
-- trial → trial, active → phase1, phase2 = nuevo
-- No necesitamos ALTER, solo actualizamos desde la app

-- Tabla de suscripciones (billing de barberías hacia nosotros)
create table if not exists subscriptions (
  shop_id         uuid primary key references shops(id) on delete cascade,
  plan            text not null default 'phase1', -- phase1 | phase2
  status          text not null default 'trial',  -- trial | active | paused | cancelled
  precio_mes      numeric(10,2),
  trial_ends_at   timestamptz not null default (now() + interval '14 days'),
  siguiente_cobro date,
  metodo_pago     text,                           -- yape | transferencia | culqi | efectivo
  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_subscriptions_updated_at
  before update on subscriptions for each row execute function set_updated_at();

-- SuperAdmins (usuarios con acceso al panel de control)
create table if not exists super_admins (
  user_id    uuid primary key,   -- Supabase auth.users
  email      text not null,
  created_at timestamptz not null default now()
);

-- Historial de pagos recibidos
create table if not exists payments (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references shops(id) on delete cascade,
  monto       numeric(10,2) not null,
  moneda      text not null default 'PEN',
  metodo      text not null,                      -- yape | transferencia | culqi | efectivo
  referencia  text,                               -- número de operación
  periodo     text,                               -- 'Apr 2026'
  notas       text,
  registrado_por uuid,                            -- super_admin user_id
  fecha       timestamptz not null default now()
);

-- RLS: solo superadmins leen/escriben estas tablas
alter table subscriptions  enable row level security;
alter table super_admins   enable row level security;
alter table payments       enable row level security;

-- Subscriptions: la barbería ve su propia, superadmin ve todas
create policy "shop_sees_own_subscription" on subscriptions
  for select to authenticated
  using (shop_id in (select shop_id from shop_users where user_id = auth.uid()));

-- Super admins y payments: solo vía service_role (admin client en el servidor)
-- No damos acceso directo a estos via RLS de usuarios normales

-- Función helper: ¿es superadmin el usuario actual?
create or replace function is_super_admin()
returns boolean language sql stable as $$
  select exists (select 1 from super_admins where user_id = auth.uid());
$$;
