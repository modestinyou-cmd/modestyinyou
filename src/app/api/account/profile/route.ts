import {NextRequest,NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {profileSchema} from '@/lib/account-validation';

export async function PATCH(request:NextRequest){
  const supabase=createServerSupabaseClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user) return NextResponse.json({error:'Sign in to update your profile.'},{status:401});
  let input:unknown;
  try{input=await request.json();}catch{return NextResponse.json({error:'Invalid request body.'},{status:400});}
  const parsed=profileSchema.safeParse(input);
  if(!parsed.success) return NextResponse.json({error:'Enter your name and a valid phone number.'},{status:400});
  const {data,error}=await supabase.from('profiles').update(parsed.data).eq('id',user.id).select('id,full_name,phone').single();
  if(error) return NextResponse.json({error:'Profile could not be saved.'},{status:400});
  return NextResponse.json({profile:data});
}
