import {requireCustomer} from '@/lib/account';
import {WishlistItems} from '@/components/AccountForms';

export default async function WishlistPage(){
  const {supabase,user}=await requireCustomer('/account/wishlist');
  const {data:items,error}=await supabase.from('wishlist_items').select('id,product_id,created_at').eq('user_id',user.id).order('created_at',{ascending:false});
  if(error) throw new Error('Wishlist could not be loaded.');
  const productIds=(items||[]).map(item=>item.product_id);
  const {data:products, error:productError}=productIds.length
    ?await supabase.from('products').select('id,name,slug,product_images(storage_path,sort_order),product_variants(price_paise,is_active)').in('id',productIds)
    :{data:[],error:null};
  if(productError) throw new Error('Wishlist products could not be loaded.');
  const productMap=new Map((products||[]).map(product=>[product.id,product]));
  const wishlist=(items||[]).flatMap(item=>{
    const product=productMap.get(item.product_id);
    if(!product) return [];
    const image=product.product_images?.slice().sort((a,b)=>a.sort_order-b.sort_order)
      .map(entry=>entry.storage_path)
      .find(path=>path.startsWith('/'));
    const availablePrices=(product.product_variants||[]).filter(variant=>variant.is_active).map(variant=>variant.price_paise);
    const price=availablePrices.length?Math.min(...availablePrices):null;
    return [{id:item.id,name:product.name,slug:product.slug,image:image||null,price}];
  });
  return <>
    <div className="account-section-heading"><span className="eyebrow">Pieces to revisit</span><h2>Wishlist</h2><p>Save products to find them again later.</p></div>
    <WishlistItems items={wishlist}/>
  </>;
}
