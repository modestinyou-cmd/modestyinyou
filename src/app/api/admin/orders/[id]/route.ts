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

export async function GET(_req:NextRequest,{params}:{params:{id:string}}){
  const admin=await getAdminUser();
  if(!admin) return NextResponse.json({error:'Unauthorized'},{status:401});

  const db=createServiceClient();
  const {data:order,error}=await db.from('orders').select('*').eq('id',params.id).single();
  if(error||!order) return NextResponse.json({error:'Order not found'},{status:404});

  const [{data:items},{data:payments},{data:events},{data:requests}]=await Promise.all([
    db.from('order_items').select('*').eq('order_id',params.id),
    db.from('payments').select('*').eq('order_id',params.id).order('created_at',{ascending:false}),
    db.from('order_events').select('*').eq('order_id',params.id).order('created_at',{ascending:false}).limit(20),
    db.from('order_requests').select('id,request_type,message,status,created_at').eq('order_id',params.id).order('created_at',{ascending:false}),
  ]);

  return NextResponse.json({order,items:items||[],payments:payments||[],events:events||[],requests:requests||[]});
}

const ALLOWED_FULFILLMENT=['pending','confirmed','processing','shipped','delivered','cancelled','returned'];

export async function PATCH(req:NextRequest,{params}:{params:{id:string}}){
  const admin=await getAdminUser();
  if(!admin) return NextResponse.json({error:'Unauthorized'},{status:401});

  let body:Record<string,unknown>;
  try{body=await req.json();}
  catch{return NextResponse.json({error:'Invalid body'},{status:400});}

  const {fulfillment_status,courier,tracking_number,tracking_url,notes}=body as Record<string,string>;

  if(fulfillment_status&&!ALLOWED_FULFILLMENT.includes(fulfillment_status)){
    return NextResponse.json({error:'Invalid fulfillment status'},{status:400});
  }

  const db=createServiceClient();
  const update:Record<string,unknown>={updated_at:new Date().toISOString()};
  if(fulfillment_status) update.fulfillment_status=fulfillment_status;
  if(courier!==undefined) update.courier=courier;
  if(tracking_number!==undefined) update.tracking_number=tracking_number;
  if(tracking_url!==undefined) update.tracking_url=tracking_url;
  if(notes!==undefined) update.notes=notes;
  if(fulfillment_status==='shipped') update.shipped_at=new Date().toISOString();
  if(fulfillment_status==='delivered') update.delivered_at=new Date().toISOString();

  const {error}=await db.from('orders').update(update).eq('id',params.id);
  if(error) return NextResponse.json({error:error.message},{status:500});

  await db.from('order_events').insert({
    order_id:params.id,
    admin_id:admin.id,
    event_type:'admin.fulfillment_update',
    payload:update,
  });

  return NextResponse.json({success:true});
}
