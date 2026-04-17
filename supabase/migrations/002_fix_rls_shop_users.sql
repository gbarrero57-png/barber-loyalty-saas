-- Fix: shop_users RLS era recursiva (se consultaba a sí misma → bloqueaba toda lectura)
-- La política correcta: cada usuario ve solo sus propias filas en shop_users

drop policy if exists "shop_users_access" on shop_users;

create policy "shop_users_access" on shop_users
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
