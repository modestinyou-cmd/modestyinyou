import {NextRequest,NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {addressSchema} from '@/lib/account-validation';

type RouteContext={params:{id:string}};

export async function PATCH(request:NextRequest,{params}:RouteContext){
  const supabase=createServerSupabaseClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user) return NextResponse.json({error:'Sign in to update this address.'},{status:401});
  let input:unknown;
  try{input=await request.json();}catch{return NextResponse.json({error:'Invalid request body.'},{status:400});}
  const parsed=addressSchema.safeParse(input);
  if(!parsed.success) return NextResponse.json({error:parsed.error.issues[0]?.message||'Check the address details.'},{status:400});
  const {is_default,...address}=parsed.data;
  const {data,error}=await supabase.from('customer_addresses').update(address).eq('id',params.id).eq('user_id',user.id).select('*').maybeSingle();
  if(error||!data) return NextResponse.json({error:'Address not found or could not be updated.'},{status:404});
  if(is_default){
    const {error:defaultError}=await supabase.rpc('set_customer_default_address',{p_address_id:params.id});
    if(defaultError) return NextResponse.json({error:'Address could not be marked as default.'},{status:400});
    data.is_default=true;
  }
  return NextResponse.json({address:data});
}

export async function DELETE(_request:NextRequest,{params}:RouteContext){
  const supabase=createServerSupabaseClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user) return NextResponse.json({error:'Sign in to remove this address.'},{status:401});
  const {data,error}=await supabase.from('customer_addresses').delete().eq('id',params.id).eq('user_id',user.id).select('id').maybeSingle();
  if(error||!data) return NextResponse.json({error:'Address not found or could not be removed.'},{status:404});
  return NextResponse.json({success:true});
}
