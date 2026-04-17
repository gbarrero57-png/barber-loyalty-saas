-- ============================================================
-- Sprint 3 — Módulo de Caja
-- ============================================================

create table if not exists cash_movements (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references shops(id) on delete cascade,
  tipo        text not null check (tipo in ('ingreso', 'egreso')),
  categoria   text not null,          -- corte, barba, combo, alquiler, insumos, etc.
  descripcion text,
  monto       numeric(10,2) not null check (monto > 0),
  metodo_pago text not null default 'efectivo',  -- efectivo | yape | transferencia | tarjeta
  barber_id   uuid references barbers(id) on delete set null,
  fecha       timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists cash_shop_fecha_idx on cash_movements (shop_id, fecha desc);
create index if not exists cash_shop_tipo_idx  on cash_movements (shop_id, tipo, fecha desc);

alter table cash_movements enable row level security;

create policy "shop_data_access" on cash_movements
  for all to authenticated
  using (shop_id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (shop_id in (select shop_id from shop_users where user_id = auth.uid()));
