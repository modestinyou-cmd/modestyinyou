import {NextRequest,NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';

type RouteContext={params:{id:string}};

export async function DELETE(_request:NextRequest,{params}:RouteContext){
  const supabase=createServerSupabaseClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user) return NextResponse.json({error:'Sign in to update your wishlist.'},{status:401});
  const {data,error}=await supabase.from('wishlist_items').delete().eq('id',params.id).eq('user_id',user.id).select('id').maybeSingle();
  if(error||!data) return NextResponse.json({error:'Wishlist item not found.'},{status:404});
  return NextResponse.json({success:true});
}
