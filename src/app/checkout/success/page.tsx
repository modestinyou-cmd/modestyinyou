'use client';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';

function SuccessContent(){
  const params=useSearchParams();
  const orderNumber=params.get('order');
  return(
    <div className="page-shell" style={{textAlign:'center',paddingTop:80}}>
      <span className="eyebrow">Order confirmed</span>
      <h1 className="page-title">Thank you!</h1>
      {orderNumber&&<p style={{fontSize:13,color:'#5a4a40',margin:'8px 0 4px'}}>Order number</p>}
      {orderNumber&&<p style={{fontSize:18,fontWeight:600,letterSpacing:'.06em',color:'var(--espresso)'}}>{orderNumber}</p>}
      <p className="page-intro" style={{margin:'24px auto',maxWidth:480}}>Your order has been placed. We will confirm it shortly. Keep this order number for your records.</p>
      <Link className="button button-dark" href="/collections">Our collection</Link>
    </div>
  );
}

export default function CheckoutSuccess(){
  return <Suspense><SuccessContent/></Suspense>;
}
