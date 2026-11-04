'use client';
import {FormEvent,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useCart} from '@/components/Store';
import {products,formatINR} from '@/lib/catalog';
import {calculateSubtotal,calculateShipping} from '@/lib/commerce';

export default function Checkout(){
  const {items,remove}=useCart();
  const router=useRouter();
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const [hasAccountSession,setHasAccountSession]=useState<boolean|null>(null);
  const [savedAddresses,setSavedAddresses]=useState<{id:string;label:string;recipient_name:string;phone:string;address_line:string;city:string;state:string;postal_code:string;is_default:boolean}[]>([]);
  const formRef=useRef<HTMLFormElement>(null);
  const checkoutRequestId=useRef<string|null>(null);

  useEffect(()=>{
    if(!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let active=true;
    fetch('/api/account/addresses').then(async response=>{
      if(response.status===401){if(active) setHasAccountSession(false);return;}
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Saved addresses could not be loaded.');
      if(active){setHasAccountSession(true);setSavedAddresses(data.addresses||[]);}
    }).catch(cause=>{
      if(active) setError(cause instanceof Error?cause.message:'Saved addresses could not be loaded.');
    });
    return()=>{active=false;};
  },[]);

  function applySavedAddress(id:string){
    const address=savedAddresses.find(item=>item.id===id);
    if(!address||!formRef.current) return;
    const values:Record<string,string>={name:address.recipient_name,phone:address.phone,address:address.address_line,city:address.city,state:address.state,pincode:address.postal_code};
    Object.entries(values).forEach(([name,value])=>{
      const field=formRef.current?.querySelector<HTMLInputElement>(`[name="${name}"]`);
      if(field) field.value=value;
    });
  }

  const rows=items.map(i=>({
    item:i,
    product:products.find(p=>p.id===i.productId),
    variant:products.find(p=>p.id===i.productId)?.variants.find(v=>v.id===i.variantId),
  })).filter(x=>x.product&&x.variant);

  const subtotal=calculateSubtotal(rows.map(x=>({unitPricePaise:x.variant!.pricePaise,quantity:x.item.quantity})));
  const shipping=calculateShipping(subtotal);

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError('');
    if(!rows.length){setError('Your bag is empty.');return;}
    setLoading(true);
    checkoutRequestId.current=checkoutRequestId.current||crypto.randomUUID();
    const fd=new FormData(e.currentTarget);
    try{
      const res=await fetch('/api/orders',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          name:fd.get('name'),
          email:fd.get('email'),
          phone:fd.get('phone'),
          address:fd.get('address'),
          city:fd.get('city'),
          state:fd.get('state'),
          pincode:fd.get('pincode'),
          payment_method:fd.get('payment_method')||'cod',
          checkout_request_id:checkoutRequestId.current,
          items:items.map(i=>({productId:i.productId,variantId:i.variantId,quantity:i.quantity})),
        }),
      });
      const data=await res.json();
      if(!res.ok){setError(data.error||'Something went wrong.');setLoading(false);return;}
      checkoutRequestId.current=null;
      // Clear cart items
      rows.forEach(r=>remove(r.item.variantId));
      router.push(`/checkout/success?order=${data.order_number}`);
    }catch{
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return(
    <div className="page-shell">
      <p className="breadcrumbs">Home / Bag / Checkout</p>
      <span className="eyebrow">Almost there</span>
      <h1 className="page-title">Checkout</h1>
      {process.env.NEXT_PUBLIC_SUPABASE_URL?(
        <div className="notice">Orders are saved to the database. Payment collection requires a configured payment provider.</div>
      ):(
        <div className="notice">Demo mode: Supabase is not configured. Orders will not be saved. Set NEXT_PUBLIC_SUPABASE_URL to enable real orders.</div>
      )}
      {!rows.length?(
        <div className="empty-state">
          <h2>Your bag is empty</h2>
          <Link className="button button-dark" href="/collections">Our collection</Link>
        </div>
      ):(
        <div className="checkout-layout">
          <form ref={formRef} onSubmit={submit}>
            <h2 className="section-title" style={{fontSize:35}}>Delivery details</h2>
            {savedAddresses.length>0&&<label className="form-field">Use a saved address
              <select defaultValue="" onChange={event=>applySavedAddress(event.target.value)}>
                <option value="">Enter a new address</option>
                {savedAddresses.map(address=><option key={address.id} value={address.id}>{address.label} · {address.city}{address.is_default?' · Default':''}</option>)}
              </select>
            </label>}
            {hasAccountSession===false&&<p className="muted">Have an account? <Link href={`/login?next=${encodeURIComponent('/checkout')}`}>Sign in</Link> to use a saved address.</p>}
            <div className="form-grid">
              <Field name="name" label="Full name" required/>
              <Field name="email" label="Email" type="email" required/>
              <Field name="phone" label="Phone number" type="tel" required/>
              <Field name="address" label="Address" required full/>
              <Field name="city" label="City" required/>
              <Field name="state" label="State" required/>
              <Field name="pincode" label="PIN code" required/>
              <label className="form-field full-span">
                <span>Payment method</span>
                <select name="payment_method">
                  <option value="cod">Cash on delivery</option>
                  <option value="online" disabled>Online payment (not configured)</option>
                </select>
              </label>
            </div>
            {error&&<p role="alert" className="notice">{error}</p>}
            <button className="button button-dark" disabled={loading}>{loading?'Placing order…':'Place order'}</button>
          </form>
          <aside className="cart-summary">
            <h2 className="section-title" style={{fontSize:32}}>Order summary</h2>
            {rows.map(r=>(
              <div className="summary-line" key={r.item.variantId}>
                <span>{r.product!.name} × {r.item.quantity}</span>
                <span>{formatINR(r.variant!.pricePaise*r.item.quantity)}</span>
              </div>
            ))}
            <div className="summary-line"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="summary-line"><span>Shipping</span><span>{formatINR(shipping)}</span></div>
            <div className="summary-line total"><span>Total</span><span>{formatINR(subtotal+shipping)}</span></div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({name,label,type='text',required=false,full=false}:{name:string;label:string;type?:string;required?:boolean;full?:boolean}){
  return(
    <label className={`form-field${full?' full-span':''}`} htmlFor={name}>
      {label}
      <input id={name} name={name} type={type} required={required}/>
    </label>
  );
}
