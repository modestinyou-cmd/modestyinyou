import {NextRequest,NextResponse} from 'next/server';
import {createServiceClient,isSupabaseServerConfigured} from '@/lib/supabase-service';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {products} from '@/lib/catalog';
import {calculateSubtotal,calculateShipping,variantAvailable,validQuantity} from '@/lib/commerce';
import {checkoutSchema} from '@/lib/account-validation';
import {getSupabasePublishableKey,getSupabaseUrl} from '@/lib/supabase-config';

export async function POST(req:NextRequest){
  if(process.env.DEMO_CHECKOUT_ENABLED!=='true'){
    return NextResponse.json({error:'Checkout is not enabled.'},{status:503});
  }

  let input:unknown;
  try{input=await req.json();}
  catch{return NextResponse.json({error:'Invalid request body.'},{status:400});}
  const parsed=checkoutSchema.safeParse(input);
  if(!parsed.success) return NextResponse.json({error:parsed.error.issues[0]?.message||'Check your checkout details.'},{status:400});
  const {name,email,phone,address,city,state,pincode,items,checkout_request_id}=parsed.data;

  if(!getSupabaseUrl()||!getSupabasePublishableKey()||!isSupabaseServerConfigured()){
    return NextResponse.json({error:'Order storage is not configured.'},{status:503});
  }
  const authClient=createServerSupabaseClient();
  const {data:{session}}=await authClient.auth.getSession();
  let customerId:string|null=null;
  if(session){
    const {data:{user},error:authError}=await authClient.auth.getUser();
    if(authError||!user) return NextResponse.json({error:'Unable to verify your sign-in. Please try again.'},{status:401});
    customerId=user.id;
  }
  const supabase=createServiceClient();
  const normalizedEmail=email.trim().toLowerCase();

  const resolvedItems=[];
  for(const item of items){
    if(!validQuantity(item.quantity)) return NextResponse.json({error:'Invalid quantity.'},{status:400});
    const product=products.find(p=>p.id===item.productId);
    const variant=product?.variants.find(v=>v.id===item.variantId);
    if(!product||!variant) return NextResponse.json({error:`Product not found: ${item.productId}`},{status:400});
    if(!variantAvailable(variant.stock,item.quantity)){
      return NextResponse.json({error:`${product.name} (${variant.color}) is not available in that quantity.`},{status:400});
    }
    resolvedItems.push({product,variant,quantity:item.quantity});
  }
  const subtotal=calculateSubtotal(resolvedItems.map(i=>({unitPricePaise:i.variant.pricePaise,quantity:i.quantity})));
  const shipping=calculateShipping(subtotal);
  const total=subtotal+shipping;

  const orderItems=resolvedItems.map(i=>({
    product_id:/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(i.product.id)?i.product.id:null,
    variant_id:/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(i.variant.id)?i.variant.id:null,
    product_name_snapshot:i.product.name,
    sku_snapshot:i.variant.sku,
    variant_name_snapshot:i.variant.color,
    unit_price_paise:i.variant.pricePaise,
    quantity:i.quantity,
    line_total_paise:i.variant.pricePaise*i.quantity,
    image_path:i.product.image,
  }));
  const {data:created,error:createError}=await supabase.rpc('create_checkout_order',{
    p_customer_name:name,
    p_email:normalizedEmail,
    p_user_id:customerId,
    p_phone:phone,
    p_shipping_address:{address,city,state,pincode},
    p_subtotal_paise:subtotal,
    p_shipping_paise:shipping,
    p_checkout_request_id:checkout_request_id||null,
    p_items:orderItems,
  });
  if(createError||!created?.[0]){
    console.error('Atomic checkout order creation failed:',createError);
    return NextResponse.json({error:'Failed to create order. Please try again.'},{status:500});
  }
  const order=created[0];

  return NextResponse.json({
    success:true,
    duplicate:order.duplicate,
    order_number:order.order_number,
    order_id:order.order_id,
    total_paise:order.total_paise,
  });
}
