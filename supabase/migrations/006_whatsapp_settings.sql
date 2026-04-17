-- Sprint 4 — WhatsApp settings por barbería
alter table shops
  add column if not exists whatsapp_enabled boolean not null default false,
  add column if not exists whatsapp_from    text;         -- número Twilio (opcional override)
