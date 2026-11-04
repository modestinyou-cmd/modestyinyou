import {NextRequest,NextResponse} from 'next/server';
import {createServiceClient} from '@/lib/supabase-service';
import {cookies} from 'next/headers';
import {createClient} from '@supabase/supabase-js';
import {getSupabasePublishableKey,getSupabaseUrl} from '@/lib/supabase-config';
import {isConfiguredAdminEmail} from '@/lib/admin-auth';

async function getAdminUser(){
  const cookieStore=cookies();
  const accessToken=cookieStore.get('sb-access-token')?.value;
  if(!accessToken) return null;
  const url=getSupabaseUrl();
  const publishableKey=getSupabasePublishableKey();
  if(!url||!publishableKey) return null;
  const client=createClient(url,publishableKey);
  const {data:{user}}=await client.auth.getUser(accessToken);
  if(!user) return null;
  if(!isConfiguredAdminEmail(user.email)) return null;
  return user;
}

export async function GET(req:NextRequest){
  const admin=await getAdminUser();
  if(!admin) return NextResponse.json({error:'Unauthorized'},{status:401});

  const {searchParams}=new URL(req.url);
  const page=Math.max(1,parseInt(searchParams.get('page')||'1'));
  const limit=20;
  const offset=(page-1)*limit;
  const search=searchParams.get('search')||'';
  const payStatus=searchParams.get('payment_status')||'';
  const fulStatus=searchParams.get('fulfillment_status')||'';
  const from=searchParams.get('from')||'';
  const to=searchParams.get('to')||'';

  const db=createServiceClient();
  let query=db.from('orders').select('id,order_number,customer_name,email,phone,total_paise,payment_status,fulfillment_status,payment_method,created_at',{count:'exact'});

  if(search) query=query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  if(payStatus) query=query.eq('payment_status',payStatus);
  if(fulStatus) query=query.eq('fulfillment_status',fulStatus);
  if(from) query=query.gte('created_at',from);
  if(to) query=query.lte('created_at',to+'T23:59:59Z');

  query=query.order('created_at',{ascending:false}).range(offset,offset+limit-1);

  const {data,error,count}=await query;
  if(error) return NextResponse.json({error:error.message},{status:500});

  // Item counts per order
  const ids=(data||[]).map(o=>o.id);
  let itemCounts:Record<string,number>={};
  if(ids.length){
    const {data:items}=await db.from('order_items').select('order_id,quantity').in('order_id',ids);
    (items||[]).forEach(i=>{itemCounts[i.order_id]=(itemCounts[i.order_id]||0)+i.quantity;});
  }

  return NextResponse.json({orders:(data||[]).map(o=>({...o,item_count:itemCounts[o.id]||0})),total:count||0,page,limit});
}
