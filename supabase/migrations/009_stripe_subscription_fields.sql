-- Sprint 2: Stripe subscription tracking fields
alter table subscriptions
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text;

create index if not exists idx_subscriptions_stripe_customer
  on subscriptions(stripe_customer_id);
