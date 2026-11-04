'use client';
import {FormEvent,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useCart} from '@/components/Store';
import {products,formatINR} from '@/lib/catalog';

type Profile={full_name:string;phone:string;email:string};
type Address={
  id:string;label:string;recipient_name:string;phone:string;address_line:string;
  city:string;state:string;postal_code:string;country:'India';is_default:boolean;
};
type WishlistItem={id:string;name:string;slug:string;image:string|null;price:number|null};

export function ProfileForm({profile}:{profile:Profile}){
  const router=useRouter();
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError('');setMessage('');setLoading(true);
    const form=new FormData(event.currentTarget);
    try{
      const response=await fetch('/api/account/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({full_name:form.get('full_name'),phone:form.get('phone')})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Unable to update profile.');
      setMessage('Profile saved.');
      router.refresh();
    }catch(cause){setError(cause instanceof Error?cause.message:'Unable to save profile.');}
    finally{setLoading(false);}
  }
  return <form className="account-form" onSubmit={submit}>
    <Field name="full_name" label="Full name" defaultValue={profile.full_name} required/>
    <Field name="email" label="Email address" type="email" defaultValue={profile.email} disabled/>
    <Field name="phone" label="Phone number" type="tel" defaultValue={profile.phone} required/>
    {error&&<p className="notice" role="alert">{error}</p>}{message&&<p className="notice" role="status">{message}</p>}
    <button className="button button-dark" disabled={loading}>{loading?'Saving…':'Save profile'}</button>
  </form>;
}

export function AddressBook({initialAddresses}:{initialAddresses:Address[]}){
  const [addresses,setAddresses]=useState(initialAddresses);
  const [editing,setEditing]=useState<Address|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError('');setLoading(true);
    const formElement=event.currentTarget;
    const form=new FormData(formElement);
    const body={
      label:form.get('label'),recipient_name:form.get('recipient_name'),phone:form.get('phone'),
      address_line:form.get('address_line'),city:form.get('city'),state:form.get('state'),
      postal_code:form.get('postal_code'),country:'India',is_default:form.get('is_default')==='on',
    };
    try{
      const response=await fetch(editing?`/api/account/addresses/${editing.id}`:'/api/account/addresses',{
        method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
      });
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||'Unable to save address.');
      const saved:Address=result.address;
      setAddresses(current=>{
        const updated=editing?current.map(item=>item.id===saved.id?saved:item):[saved,...current];
        return saved.is_default?updated.map(item=>({...item,is_default:item.id===saved.id})):updated;
      });
      setEditing(null);
      formElement.reset();
    }catch(cause){setError(cause instanceof Error?cause.message:'Unable to save address.');}
    finally{setLoading(false);}
  }
  async function remove(id:string){
    setError('');
    try{
      const response=await fetch(`/api/account/addresses/${id}`,{method:'DELETE'});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||'Unable to remove address.');
      setAddresses(current=>current.filter(item=>item.id!==id));
    }catch(cause){setError(cause instanceof Error?cause.message:'Unable to remove address.');}
  }
  async function makeDefault(address:Address){
    setError('');
    try{
      const response=await fetch(`/api/account/addresses/${address.id}`,{
        method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({...address,is_default:true}),
      });
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||'Unable to update default address.');
      setAddresses(current=>current.map(item=>({...item,is_default:item.id===address.id})));
    }catch(cause){setError(cause instanceof Error?cause.message:'Unable to update default address.');}
  }
  return <div className="address-book">
    <div className="address-list">{addresses.map(address=><article className="address-card" key={address.id}>
      <div className="address-card-heading"><h3>{address.label}</h3>{address.is_default&&<span className="status-badge">Default</span>}</div>
      <p><strong>{address.recipient_name}</strong><br/>{address.phone}<br/>{address.address_line}<br/>{address.city}, {address.state} {address.postal_code}, {address.country}</p>
      <div className="address-actions"><button type="button" onClick={()=>{setEditing(address);window.scrollTo({top:0,behavior:'smooth'});}}>Edit</button>{!address.is_default&&<button type="button" onClick={()=>makeDefault(address)}>Set as default</button>}<button type="button" onClick={()=>remove(address.id)}>Remove</button></div>
    </article>)}</div>
    <form key={editing?.id||'new-address'} className="account-form address-editor" onSubmit={submit}>
      <h2>{editing?'Edit address':'Add an address'}</h2>
      <Field name="label" label="Address label" defaultValue={editing?.label||'Home'} required/>
      <Field name="recipient_name" label="Recipient name" defaultValue={editing?.recipient_name||''} required/>
      <Field name="phone" label="Phone number" type="tel" defaultValue={editing?.phone||''} required/>
      <Field name="address_line" label="Address" defaultValue={editing?.address_line||''} required/>
      <div className="account-form-row"><Field name="city" label="City" defaultValue={editing?.city||''} required/><Field name="state" label="State" defaultValue={editing?.state||''} required/></div>
      <Field name="postal_code" label="6-digit PIN code" inputMode="numeric" defaultValue={editing?.postal_code||''} pattern="[0-9]{6}" required/>
      <label className="checkbox-field"><input name="is_default" type="checkbox" defaultChecked={editing?.is_default}/> Set as default address</label>
      {error&&<p role="alert" className="notice">{error}</p>}
      <div className="account-form-actions"><button className="button button-dark" disabled={loading}>{loading?'Saving…':editing?'Update address':'Save address'}</button>{editing&&<button className="button button-outline" type="button" onClick={()=>setEditing(null)}>Cancel</button>}</div>
    </form>
  </div>;
}

export function WishlistItems({items}:{items:WishlistItem[]}){
  const [savedItems,setSavedItems]=useState(items);
  const [error,setError]=useState('');
  const {add}=useCart();
  async function remove(id:string){
    setError('');
    try{
      const response=await fetch(`/api/account/wishlist/${id}`,{method:'DELETE'});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||'Unable to remove item.');
      setSavedItems(current=>current.filter(item=>item.id!==id));
    }catch(cause){setError(cause instanceof Error?cause.message:'Unable to remove item.');}
  }
  return <div>
    {error&&<p className="notice" role="alert">{error}</p>}
    {!savedItems.length?<div className="empty-state"><h2>Your wishlist is empty</h2><p>Save products you would like to revisit.</p><Link className="button button-dark" href="/collections">Explore the collection</Link></div>:<div className="wishlist-grid">{savedItems.map(item=>{
      const demoProduct=products.find(product=>product.slug===item.slug);
      const availableVariant=demoProduct?.variants.find(variant=>variant.stock>0);
      return <article className="wishlist-card" key={item.id}>
        <Link href={`/products/${item.slug}`} className="wishlist-image">
          {item.image?<Image src={item.image} alt={item.name} fill sizes="(max-width:640px) 45vw, 25vw"/>:<span>{item.name}</span>}
        </Link>
        <h3><Link href={`/products/${item.slug}`}>{item.name}</Link></h3>
        {item.price!==null&&<p>{formatINR(item.price)}</p>}
        <div className="wishlist-actions">
          {demoProduct&&availableVariant&&<button className="button button-outline" onClick={()=>add(demoProduct,availableVariant.id,1)}>Add to bag</button>}
          <button type="button" className="text-button" onClick={()=>remove(item.id)}>Remove</button>
        </div>
      </article>;
    })}</div>}
  </div>;
}

export function WishlistToggle({slug}:{slug:string}){
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  async function save(){
    setError('');setMessage('');setLoading(true);
    try{
      const response=await fetch('/api/account/wishlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug})});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||'Sign in to save this product.');
      setMessage('Saved to your wishlist.');
    }catch(cause){setError(cause instanceof Error?cause.message:'Unable to save this product.');}
    finally{setLoading(false);}
  }
  return <div className="wishlist-toggle">
    <button className="button button-outline full" type="button" disabled={loading} onClick={save}>{loading?'Saving…':'Save to wishlist'}</button>
    {message&&<p role="status" className="muted">{message}</p>}
    {error&&<p role="alert" className="muted">{error} <Link href={`/login?next=${encodeURIComponent(`/products/${slug}`)}`}>Sign in</Link></p>}
  </div>;
}

export function OrderRequestForm({orderId,fulfillmentStatus}:{orderId:string;fulfillmentStatus:string}){
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const eligibleCancellation=['pending','confirmed'].includes(fulfillmentStatus);
  const delivered=fulfillmentStatus==='delivered';
  async function send(){
    setError('');setMessage('');setLoading(true);
    try{
      const response=await fetch(`/api/account/orders/${orderId}/requests`,{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_type:'cancellation'}),
      });
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||'Unable to submit request.');
      setMessage('Cancellation request submitted for review.');
    }catch(cause){setError(cause instanceof Error?cause.message:'Unable to submit request.');}
    finally{setLoading(false);}
  }
  if(!eligibleCancellation&&!delivered) return null;
  return <div className="order-request">
    <h2>Order support</h2>
    <p>Requests are reviewed by the store; submitting one does not change payment or fulfilment status.</p>
    {error&&<p className="notice" role="alert">{error}</p>}{message&&<p className="notice" role="status">{message}</p>}
    {eligibleCancellation&&<button className="button button-outline" disabled={loading} onClick={send}>Request cancellation</button>}
    {delivered&&<p>Return eligibility is not yet configured. Please <Link href="/contact">contact the store team</Link> before sending an item back.</p>}
  </div>;
}

function Field({name,label,type='text',defaultValue,disabled=false,required=false,pattern,inputMode}:{name:string;label:string;type?:string;defaultValue?:string;disabled?:boolean;required?:boolean;pattern?:string;inputMode?:'text'|'numeric'}){
  return <label className="form-field" htmlFor={name}>{label}<input id={name} name={name} type={type} defaultValue={defaultValue} disabled={disabled} required={required} pattern={pattern} inputMode={inputMode}/></label>;
}
