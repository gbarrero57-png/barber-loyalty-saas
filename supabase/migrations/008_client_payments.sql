-- Sprint 6 — Pagos de clientes vía Culqi
create table if not exists client_payments (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references shops(id) on delete cascade,
  appointment_id  uuid references appointments(id) on delete set null,
  culqi_charge_id text unique,
  email           text,
  monto           numeric(10,2) not null,
  concepto        text not null,
  estado          text not null default 'pendiente',  -- pendiente | pagado | fallido
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists client_payments_shop_idx on client_payments (shop_id, created_at desc);
create index if not exists client_payments_appt_idx on client_payments (appointment_id);

alter table client_payments enable row level security;

create policy "shop_data_access" on client_payments
  for all to authenticated
  using  (shop_id in (select shop_id from shop_users where user_id = auth.uid()))
  with check (shop_id in (select shop_id from shop_users where user_id = auth.uid()));
