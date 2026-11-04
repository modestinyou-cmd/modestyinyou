-- Customer account data. Apply after the initial schema and order-management migrations.
alter table public.profiles
  add column if not exists full_name text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists updated_at timestamptz not null default now();

alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists checkout_request_id uuid;
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check(payment_status in ('pending','authorized','paid','failed','refunded','partially_refunded','cod_pending'));
create index if not exists orders_user_created_idx on public.orders(user_id,created_at desc);
create unique index if not exists orders_checkout_request_idx on public.orders(checkout_request_id)
  where checkout_request_id is not null;

-- Service-role clients bypass RLS; these legacy permissive policies accidentally
-- allowed untrusted API roles to write order/payment state directly.
drop policy if exists "service role inserts orders" on public.orders;
drop policy if exists "service role inserts order items" on public.order_items;
drop policy if exists "service role inserts payments" on public.payments;
drop policy if exists "service role updates payments" on public.payments;
drop policy if exists "service role updates orders" on public.orders;

alter table public.payments drop constraint if exists payments_status_check;
alter table public.payments add constraint payments_status_check
  check(status in ('created','authorized','captured','failed','partially_refunded','refunded'));

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customer_addresses_user_idx on public.customer_addresses(user_id,created_at desc);
create unique index if not exists customer_addresses_one_default_idx
  on public.customer_addresses(user_id) where is_default;

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id,product_id)
);
create index if not exists wishlist_items_user_created_idx on public.wishlist_items(user_id,created_at desc);

create table if not exists public.order_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null check(request_type in ('cancellation','return')),
  message text not null default '',
  status text not null default 'requested' check(status in ('requested','approved','declined','completed')),
  created_at timestamptz not null default now(),
  unique(order_id,request_type)
);
create index if not exists order_requests_user_idx on public.order_requests(user_id,created_at desc);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  provider_object_id text,
  payment_id uuid not null references public.payments(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now(),
  unique(provider,provider_event_id)
);
create index if not exists payment_webhook_payment_idx on public.payment_webhook_events(payment_id,processed_at desc);
create unique index if not exists payment_webhook_object_idx
  on public.payment_webhook_events(provider,provider_object_id) where provider_object_id is not null;
alter table public.payment_webhook_events enable row level security;
create policy "admins read payment webhook events" on public.payment_webhook_events
  for select using(public.is_admin());

create or replace function public.create_checkout_order(
  p_customer_name text,
  p_email text,
  p_user_id uuid,
  p_phone text,
  p_shipping_address jsonb,
  p_subtotal_paise integer,
  p_shipping_paise integer,
  p_checkout_request_id uuid,
  p_items jsonb
) returns table(order_id uuid,order_number text,total_paise integer,duplicate boolean)
language plpgsql security definer set search_path=public as $$
declare
  order_row public.orders%rowtype;
  item jsonb;
  payment_total integer;
  computed_subtotal integer:=0;
  item_quantity integer;
  unit_price integer;
  line_total integer;
begin
  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)<1 or jsonb_array_length(p_items)>50 then
    raise exception 'Invalid order items';
  end if;
  for item in select value from jsonb_array_elements(p_items) loop
    item_quantity=(item->>'quantity')::integer;
    unit_price=(item->>'unit_price_paise')::integer;
    line_total=(item->>'line_total_paise')::integer;
    if item_quantity<1 or item_quantity>10 or unit_price<0 or line_total<>unit_price*item_quantity then
      raise exception 'Invalid order item totals';
    end if;
    computed_subtotal=computed_subtotal+line_total;
  end loop;
  if computed_subtotal<>p_subtotal_paise or p_shipping_paise<0 then
    raise exception 'Order total mismatch';
  end if;
  payment_total=p_subtotal_paise+p_shipping_paise;

  if p_checkout_request_id is not null then
    select * into order_row from public.orders
      where checkout_request_id=p_checkout_request_id for update;
    if found then
      if order_row.email<>lower(trim(p_email)) or order_row.user_id is distinct from p_user_id then
        raise exception 'Idempotency key does not belong to this customer';
      end if;
      return query select order_row.id,order_row.order_number,order_row.total_paise,true;
      return;
    end if;
  end if;

  begin
    insert into public.orders(
      customer_name,email,user_id,phone,shipping_address,subtotal_paise,shipping_paise,
      discount_paise,tax_paise,total_paise,payment_method,payment_status,fulfillment_status,checkout_request_id
    ) values(
      trim(p_customer_name),lower(trim(p_email)),p_user_id,trim(p_phone),p_shipping_address,p_subtotal_paise,
      p_shipping_paise,0,0,payment_total,'cod','cod_pending','pending',p_checkout_request_id
    ) returning * into order_row;
  exception when unique_violation then
    if p_checkout_request_id is null then raise; end if;
    select * into order_row from public.orders where checkout_request_id=p_checkout_request_id;
    if not found or order_row.email<>lower(trim(p_email)) or order_row.user_id is distinct from p_user_id then
      raise exception 'Unable to reuse checkout request';
    end if;
    return query select order_row.id,order_row.order_number,order_row.total_paise,true;
    return;
  end;

  for item in select value from jsonb_array_elements(p_items) loop
    insert into public.order_items(
      order_id,product_id,variant_id,sku_snapshot,product_name_snapshot,variant_name_snapshot,
      unit_price_paise,quantity,line_total_paise,image_path
    ) values(
      order_row.id,nullif(item->>'product_id','')::uuid,nullif(item->>'variant_id','')::uuid,
      item->>'sku_snapshot',item->>'product_name_snapshot',item->>'variant_name_snapshot',
      (item->>'unit_price_paise')::integer,(item->>'quantity')::integer,
      (item->>'line_total_paise')::integer,nullif(item->>'image_path','')
    );
  end loop;

  insert into public.payments(order_id,provider,status,amount_paise,refund_amount_paise)
    values(order_row.id,'cod','created',payment_total,0);
  return query select order_row.id,order_row.order_number,order_row.total_paise,false;
end;
$$;
revoke all on function public.create_checkout_order(text,text,uuid,text,jsonb,integer,integer,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.create_checkout_order(text,text,uuid,text,jsonb,integer,integer,uuid,jsonb) to service_role;

create or replace function public.process_razorpay_webhook(
  p_event_id text,
  p_event_type text,
  p_provider_order_id text,
  p_provider_payment_id text,
  p_provider_object_id text,
  p_amount_paise integer,
  p_payload jsonb
) returns text language plpgsql security definer set search_path=public as $$
declare
  payment_row public.payments%rowtype;
  event_row_id uuid;
  new_refund_total integer;
begin
  if p_event_type not in ('payment.captured','payment.failed','refund.processed') then
    return 'ignored';
  end if;
  if p_event_type='refund.processed' then
    select * into payment_row from public.payments
      where provider='razorpay' and provider_payment_id=p_provider_payment_id for update;
  else
    select * into payment_row from public.payments
      where provider='razorpay' and provider_order_id=p_provider_order_id for update;
  end if;
  if not found then return 'unmatched'; end if;
  if p_event_type<>'refund.processed' and p_amount_paise is distinct from payment_row.amount_paise then
    raise exception 'Payment amount mismatch';
  end if;
  insert into public.payment_webhook_events(provider,provider_event_id,provider_object_id,payment_id,event_type,payload)
    values('razorpay',p_event_id,case when p_event_type='refund.processed' then p_provider_object_id else null end,
      payment_row.id,p_event_type,p_payload)
    on conflict(provider,provider_event_id) do nothing
    returning id into event_row_id;
  if event_row_id is null then return 'duplicate'; end if;

  if p_event_type='payment.captured' then
    if payment_row.status not in ('refunded','partially_refunded') then
      update public.payments set provider_payment_id=p_provider_payment_id,status='captured',
        confirmed_at=now(),raw_webhook=p_payload where id=payment_row.id;
      update public.orders set payment_status='paid',
        fulfillment_status=case when fulfillment_status in ('pending','confirmed') then 'confirmed' else fulfillment_status end
        where id=payment_row.order_id and payment_status not in ('refunded','partially_refunded');
    end if;
  elsif p_event_type='payment.failed' then
    if payment_row.status not in ('captured','refunded','partially_refunded') then
      update public.payments set provider_payment_id=p_provider_payment_id,status='failed',
        raw_webhook=p_payload where id=payment_row.id;
      update public.orders set payment_status='failed'
        where id=payment_row.order_id and payment_status not in ('paid','refunded','partially_refunded');
    end if;
  else
    if p_amount_paise is null or p_amount_paise<=0 then raise exception 'Invalid refund amount'; end if;
    if payment_row.status not in ('captured','partially_refunded') then raise exception 'Payment is not refundable'; end if;
    new_refund_total=payment_row.refund_amount_paise+p_amount_paise;
    if new_refund_total>payment_row.amount_paise then raise exception 'Refund exceeds payment amount'; end if;
    update public.payments set refund_amount_paise=new_refund_total,
      status=case when new_refund_total=amount_paise then 'refunded' else 'partially_refunded' end,
      raw_webhook=p_payload where id=payment_row.id;
    update public.orders set payment_status=case
      when new_refund_total=payment_row.amount_paise then 'refunded' else 'partially_refunded' end
      where id=payment_row.order_id;
  end if;
  return 'processed';
end;
$$;
revoke all on function public.process_razorpay_webhook(text,text,text,text,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.process_razorpay_webhook(text,text,text,text,text,integer,jsonb) to service_role;

create trigger customer_addresses_updated_at before update on public.customer_addresses
  for each row execute function public.set_updated_at();
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.create_customer_profile()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,role,full_name)
  values(new.id,'customer',coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict(id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
  for each row execute procedure public.create_customer_profile();
insert into public.profiles(id,role,full_name)
select u.id,'customer',coalesce(u.raw_user_meta_data->>'full_name','')
from auth.users u
on conflict(id) do nothing;

create or replace function public.set_customer_default_address(p_address_id uuid)
returns void language plpgsql security invoker set search_path=public as $$
begin
  if not exists(select 1 from public.customer_addresses where id=p_address_id and user_id=auth.uid()) then
    raise exception 'Address not found';
  end if;
  update public.customer_addresses
  set is_default=(id=p_address_id)
  where user_id=auth.uid();
end;
$$;
revoke all on function public.set_customer_default_address(uuid) from public,anon;
grant execute on function public.set_customer_default_address(uuid) to authenticated;

alter table public.customer_addresses enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.order_requests enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles
  for select using(id=auth.uid() or public.is_admin());
create policy "users update own customer profile" on public.profiles
  for update using(id=auth.uid() and role='customer')
  with check(id=auth.uid() and role='customer');

create policy "customers read own orders" on public.orders
  for select using(user_id=auth.uid());
create policy "customers read own order items" on public.order_items
  for select using(exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
create policy "customers read own payments" on public.payments
  for select using(exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));

create policy "customers manage own addresses" on public.customer_addresses
  for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "customers read own wishlist" on public.wishlist_items
  for select using(user_id=auth.uid());
create policy "customers add own wishlist items" on public.wishlist_items
  for insert with check(user_id=auth.uid() and exists(
    select 1 from public.products p where p.id=product_id and p.is_published
  ));
create policy "customers remove own wishlist items" on public.wishlist_items
  for delete using(user_id=auth.uid());
create policy "customers read own order requests" on public.order_requests
  for select using(user_id=auth.uid());
create policy "customers submit own order requests" on public.order_requests
  for insert with check(user_id=auth.uid() and status='requested' and exists(
    select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()
  ));

create policy "admins manage customer addresses" on public.customer_addresses
  for all using(public.is_admin()) with check(public.is_admin());
create policy "admins manage wishlists" on public.wishlist_items
  for all using(public.is_admin()) with check(public.is_admin());
create policy "admins manage order requests" on public.order_requests
  for all using(public.is_admin()) with check(public.is_admin());
