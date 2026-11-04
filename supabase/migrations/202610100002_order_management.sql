-- Migration: order management addendum
-- Apply after 202610100001_initial_schema.sql

-- Add missing columns to orders
alter table public.orders
  add column if not exists payment_method text not null default 'cod',
  add column if not exists tax_paise integer not null default 0 check(tax_paise>=0),
  add column if not exists tracking_url text,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists notes text;

-- Add missing columns to payments
alter table public.payments
  add column if not exists amount_paise integer not null default 0 check(amount_paise>=0),
  add column if not exists refund_amount_paise integer not null default 0 check(refund_amount_paise>=0),
  add column if not exists confirmed_at timestamptz,
  add column if not exists raw_webhook jsonb;

-- Add product_id snapshot to order_items
alter table public.order_items
  add column if not exists product_id uuid references public.products(id) on delete set null,
  add column if not exists image_path text;

-- Shipment / admin audit log
create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  admin_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events(order_id, created_at desc);

alter table public.order_events enable row level security;
create policy "admins manage order events" on public.order_events
  for all using(public.is_admin()) with check(public.is_admin());

-- Allow service role to insert orders (used by server-side API route)
-- Public anon cannot insert; only the service-role key used server-side can.
create policy "service role inserts orders" on public.orders
  for insert with check(true);
create policy "service role inserts order items" on public.order_items
  for insert with check(true);
create policy "service role inserts payments" on public.payments
  for insert with check(true);
create policy "service role updates payments" on public.payments
  for update using(true) with check(true);
create policy "service role updates orders" on public.orders
  for update using(true) with check(true);

-- Additional indexes
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_fulfillment_status_idx on public.orders(fulfillment_status);
create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists payments_provider_order_idx on public.payments(provider_order_id);
