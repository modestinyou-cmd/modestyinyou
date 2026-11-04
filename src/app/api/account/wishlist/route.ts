import {NextRequest,NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {wishlistInputSchema} from '@/lib/account-validation';

export async function GET(){
  const supabase=createServerSupabaseClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user) return NextResponse.json({error:'Sign in to view your wishlist.'},{status:401});
  const {data,error}=await supabase.from('wishlist_items').select('id,product_id,created_at,products(id,name,slug,product_images(storage_path,alt_text,sort_order),product_variants(price_paise,is_active))').eq('user_id',user.id).order('created_at',{ascending:false});
  if(error) return NextResponse.json({error:'Wishlist could not be loaded.'},{status:500});
  return NextResponse.json({items:data});
}

export async function POST(request:NextRequest){
  const supabase=createServerSupabaseClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user) return NextResponse.json({error:'Sign in to save products.'},{status:401});
  let input:unknown;
  try{input=await request.json();}catch{return NextResponse.json({error:'Invalid request body.'},{status:400});}
  const parsed=wishlistInputSchema.safeParse(input);
  if(!parsed.success) return NextResponse.json({error:'A valid product is required.'},{status:400});
  const {data:product,error:productError}=await supabase.from('products').select('id').eq('slug',parsed.data.slug).eq('is_published',true).maybeSingle();
  if(productError||!product) return NextResponse.json({error:'This product is not available to save.'},{status:404});
  const {data,error}=await supabase.from('wishlist_items').upsert(
    {user_id:user.id,product_id:product.id},
    {onConflict:'user_id,product_id',ignoreDuplicates:true},
  ).select('id,product_id').maybeSingle();
  if(error) return NextResponse.json({error:'This product could not be saved.'},{status:400});
  return NextResponse.json({item:data},{status:201});
}
