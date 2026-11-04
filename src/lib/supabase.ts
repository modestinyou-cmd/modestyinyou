import {createClient} from '@supabase/supabase-js';
import {getSupabasePublishableKey,getSupabaseUrl} from '@/lib/supabase-config';

// Browser-safe publishable client — database access remains governed by RLS.
export function createAnonClient(){
  const url=getSupabaseUrl();
  const publishableKey=getSupabasePublishableKey();
  if(!url||!publishableKey) throw new Error('Supabase Auth is not configured.');
  return createClient(url,publishableKey);
}

// Admin client using user's JWT — for RLS-protected admin queries
export function createAdminClient(accessToken:string){
  const url=getSupabaseUrl();
  const publishableKey=getSupabasePublishableKey();
  if(!url||!publishableKey) throw new Error('Supabase Auth is not configured.');
  const client=createClient(url,publishableKey);
  client.auth.setSession({access_token:accessToken,refresh_token:''});
  return client;
}

export type PaymentStatus='pending'|'authorized'|'paid'|'failed'|'refunded'|'partially_refunded'|'cod_pending';
export type FulfillmentStatus='pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'|'returned';

export interface Order{
  id:string;
  order_number:string;
  customer_name:string;
  email:string;
  phone:string;
  shipping_address:Record<string,string>;
  subtotal_paise:number;
  discount_paise:number;
  shipping_paise:number;
  tax_paise:number;
  total_paise:number;
  payment_status:PaymentStatus;
  fulfillment_status:FulfillmentStatus;
  payment_method:string;
  courier:string|null;
  tracking_number:string|null;
  tracking_url:string|null;
  shipped_at:string|null;
  delivered_at:string|null;
  notes:string|null;
  created_at:string;
  updated_at:string;
}

export interface OrderItem{
  id:string;
  order_id:string;
  product_id:string|null;
  variant_id:string|null;
  product_name_snapshot:string;
  sku_snapshot:string;
  variant_name_snapshot:string;
  unit_price_paise:number;
  quantity:number;
  line_total_paise:number;
  image_path:string|null;
}

export interface Payment{
  id:string;
  order_id:string;
  provider:string;
  provider_order_id:string|null;
  provider_payment_id:string|null;
  status:string;
  amount_paise:number;
  refund_amount_paise:number;
  confirmed_at:string|null;
  created_at:string;
  updated_at:string;
}
