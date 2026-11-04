import {NextRequest,NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {cancellationRequestSchema} from '@/lib/account-validation';
type RouteContext={params:{id:string}};

export async function POST(request:NextRequest,{params}:RouteContext){
  const supabase=createServerSupabaseClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user) return NextResponse.json({error:'Sign in to submit an order request.'},{status:401});
  let input:unknown;
  try{input=await request.json();}catch{return NextResponse.json({error:'Invalid request body.'},{status:400});}
  const parsed=cancellationRequestSchema.safeParse(input);
  if(!parsed.success) return NextResponse.json({error:'Choose a valid request type.'},{status:400});
  const {data:order,error:orderError}=await supabase.from('orders').select('id,fulfillment_status').eq('id',params.id).eq('user_id',user.id).maybeSingle();
  if(orderError||!order) return NextResponse.json({error:'Order not found.'},{status:404});
  const eligible=['pending','confirmed'].includes(order.fulfillment_status);
  if(!eligible) return NextResponse.json({error:'This order is not eligible for that request.'},{status:409});
  const {data,error}=await supabase.from('order_requests').insert({
    order_id:order.id,
    user_id:user.id,
    request_type:parsed.data.request_type,
    message:parsed.data.message,
    status:'requested',
  }).select('id,status').single();
  if(error) return NextResponse.json({error:'A request of this type already exists or could not be submitted.'},{status:409});
  return NextResponse.json({request:data},{status:201});
}
