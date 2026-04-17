alter table shops
  add column if not exists onboarding_done boolean not null default false;
