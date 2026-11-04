import {NextRequest,NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {addressSchema} from '@/lib/account-validation';

export async function GET(){
  const supabase=createServerSupabaseClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user) return NextResponse.json({error:'Sign in to view addresses.'},{status:401});
  const {data,error}=await supabase.from('customer_addresses').select('*').eq('user_id',user.id).order('is_default',{ascending:false}).order('created_at',{ascending:false});
  if(error) return NextResponse.json({error:'Addresses could not be loaded.'},{status:500});
  return NextResponse.json({addresses:data});
}

export async function POST(request:NextRequest){
  const supabase=createServerSupabaseClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user) return NextResponse.json({error:'Sign in to save an address.'},{status:401});
  let input:unknown;
  try{input=await request.json();}catch{return NextResponse.json({error:'Invalid request body.'},{status:400});}
  const parsed=addressSchema.safeParse(input);
  if(!parsed.success) return NextResponse.json({error:parsed.error.issues[0]?.message||'Check the address details.'},{status:400});
  const {is_default,...address}=parsed.data;
  const {count,error:countError}=await supabase.from('customer_addresses').select('id',{count:'exact',head:true}).eq('user_id',user.id);
  if(countError) return NextResponse.json({error:'Existing addresses could not be checked.'},{status:500});
  const shouldBeDefault=is_default||count===0;
  const {data:created,error}=await supabase.from('customer_addresses').insert({...address,user_id:user.id}).select('*').single();
  if(error||!created) return NextResponse.json({error:'Address could not be saved.'},{status:400});
  if(shouldBeDefault){
    const {error:defaultError}=await supabase.rpc('set_customer_default_address',{p_address_id:created.id});
    if(defaultError){
      const {error:cleanupError}=await supabase.from('customer_addresses').delete().eq('id',created.id).eq('user_id',user.id);
      if(cleanupError) console.error('Failed to remove address after default assignment failed:',cleanupError);
      return NextResponse.json({error:'Address could not be marked as default.'},{status:400});
    }
    created.is_default=true;
  }
  return NextResponse.json({address:created},{status:201});
}
