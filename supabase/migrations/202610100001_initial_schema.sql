create extension if not exists pgcrypto;

create table public.categories (
 id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
 description text, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.products (
 id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id) on delete set null,
 name text not null, slug text not null unique, description text not null default '', material text, care_instructions text,
 is_published boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_variants (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 sku text not null unique, color_name text not null, color_hex text, price_paise integer not null check(price_paise>=0),
 stock_quantity integer not null default 0 check(stock_quantity>=0), is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.product_images (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 variant_id uuid references public.product_variants(id) on delete set null, storage_path text not null, alt_text text not null,
 sort_order integer not null default 0
);
create table public.orders (
 id uuid primary key default gen_random_uuid(), order_number text not null unique default ('MIY-' || upper(substr(encode(gen_random_bytes(10),'hex'),1,12))),
 customer_name text not null, email text not null, phone text not null, shipping_address jsonb not null,
 subtotal_paise integer not null check(subtotal_paise>=0), shipping_paise integer not null check(shipping_paise>=0), discount_paise integer not null default 0 check(discount_paise>=0),
 total_paise integer not null check(total_paise>=0), payment_status text not null default 'pending' check(payment_status in ('pending','authorized','paid','failed','refunded','cod_pending')),
 fulfillment_status text not null default 'pending' check(fulfillment_status in ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
 courier text, tracking_number text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 variant_id uuid references public.product_variants(id) on delete set null, sku_snapshot text not null, product_name_snapshot text not null,
 variant_name_snapshot text not null, unit_price_paise integer not null check(unit_price_paise>=0), quantity integer not null check(quantity>0),
 line_total_paise integer not null check(line_total_paise>=0)
);
create table public.payments (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 provider text not null, provider_order_id text, provider_payment_id text, status text not null default 'created' check(status in ('created','authorized','captured','failed','refunded')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(provider,provider_payment_id)
);
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade, role text not null default 'customer' check(role in ('customer','admin')), created_at timestamptz not null default now()
);
create index products_published_idx on public.products(is_published);
create index product_variants_lookup_idx on public.product_variants(product_id,is_active);
create index product_images_product_idx on public.product_images(product_id,sort_order);
create index orders_created_idx on public.orders(created_at desc);
create index orders_email_idx on public.orders(email);
create index order_items_order_idx on public.order_items(order_id);
create index payments_order_idx on public.payments(order_id);

create function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;

alter table public.categories enable row level security; alter table public.products enable row level security;
alter table public.product_variants enable row level security; alter table public.product_images enable row level security;
alter table public.orders enable row level security; alter table public.order_items enable row level security;
alter table public.payments enable row level security; alter table public.profiles enable row level security;
create policy "public reads active categories" on public.categories for select using(is_active);
create policy "public reads published products" on public.products for select using(is_published);
create policy "public reads active variants of published products" on public.product_variants for select using(is_active and exists(select 1 from public.products p where p.id=product_id and p.is_published));
create policy "public reads images of published products" on public.product_images for select using(exists(select 1 from public.products p where p.id=product_id and p.is_published));
create policy "admins manage categories" on public.categories for all using(public.is_admin()) with check(public.is_admin());
create policy "admins manage products" on public.products for all using(public.is_admin()) with check(public.is_admin());
create policy "admins manage variants" on public.product_variants for all using(public.is_admin()) with check(public.is_admin());
create policy "admins manage images" on public.product_images for all using(public.is_admin()) with check(public.is_admin());
create policy "admins manage orders" on public.orders for all using(public.is_admin()) with check(public.is_admin());
create policy "admins manage order items" on public.order_items for all using(public.is_admin()) with check(public.is_admin());
create policy "admins manage payments" on public.payments for all using(public.is_admin()) with check(public.is_admin());
create policy "users read own profile" on public.profiles for select using(id=auth.uid() or public.is_admin());
create policy "admins update profiles" on public.profiles for update using(public.is_admin()) with check(public.is_admin());
-- Deliberately no public order/payment write policy: order creation, payment events, stock reservations,
-- and customer access must be implemented through authenticated/validated server functions.

-- Storage bucket creation is performed in the Supabase dashboard or a privileged setup script.
-- Keep the bucket private unless signed URLs are used for catalogue imagery.
