import Link from 'next/link';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {requireCustomer} from '@/lib/account';
import {formatINR} from '@/lib/catalog';
import {OrderRequestForm} from '@/components/AccountForms';

type PageContext={params:{id:string}};

export default async function OrderDetailsPage({params}:PageContext){
  const {supabase,user}=await requireCustomer(`/account/orders/${params.id}`);
  const {data:order,error}=await supabase.from('orders').select('*').eq('id',params.id).eq('user_id',user.id).maybeSingle();
  if(error) throw new Error('Order details could not be loaded.');
  if(!order) notFound();
  const [{data:items,error:itemsError},{data:payments,error:paymentsError},{data:requests,error:requestsError}]=await Promise.all([
    supabase.from('order_items').select('*').eq('order_id',order.id),
    supabase.from('payments').select('id,provider,status,amount_paise,refund_amount_paise,created_at').eq('order_id',order.id).order('created_at',{ascending:false}),
    supabase.from('order_requests').select('id,request_type,status,created_at').eq('order_id',order.id).eq('user_id',user.id),
  ]);
  if(itemsError) throw new Error('Order items could not be loaded.');
  if(paymentsError||requestsError) throw new Error('Order payment or support details could not be loaded.');
  const address=order.shipping_address as Record<string,string>;
  const latestPayment=payments?.[0];
  const trackingUrl=order.tracking_url&&/^https?:\/\//i.test(order.tracking_url)?order.tracking_url:null;
  return <>
    <p className="breadcrumbs"><Link href="/account/orders">Orders</Link> / {order.order_number}</p>
    <div className="account-section-heading"><span className="eyebrow">Order details</span><h2>{order.order_number}</h2><p>Placed {new Date(order.created_at).toLocaleDateString('en-IN',{dateStyle:'long'})}</p></div>
    <div className="order-details-status"><Status value={order.payment_status}/><Status value={order.fulfillment_status}/></div>
    <div className="account-panel order-detail-items"><h3>Items</h3>
      {(items||[]).map(item=><div className="order-detail-item" key={item.id}>
        {item.image_path?.startsWith('/')&&<Image src={item.image_path} alt="" width={86} height={106}/>}
        <div className="order-detail-item-main"><strong>{item.product_name_snapshot}</strong><span>{item.variant_name_snapshot} · SKU {item.sku_snapshot}</span><span>Quantity: {item.quantity}</span></div>
        <div className="order-line-prices"><span>{formatINR(item.unit_price_paise)} each</span><strong>{formatINR(item.line_total_paise)}</strong></div>
      </div>)}
      <div className="order-totals">
        <div><span>Subtotal</span><span>{formatINR(order.subtotal_paise)}</span></div>
        {order.discount_paise>0&&<div><span>Discount</span><span>−{formatINR(order.discount_paise)}</span></div>}
        <div><span>Shipping</span><span>{formatINR(order.shipping_paise)}</span></div>
        {order.tax_paise>0&&<div><span>Tax</span><span>{formatINR(order.tax_paise)}</span></div>}
        <div className="order-total"><strong>Total</strong><strong>{formatINR(order.total_paise)}</strong></div>
      </div>
    </div>
    <div className="order-meta-grid">
      <section className="account-panel"><h3>Delivery</h3><p>{order.customer_name}<br/>{address.address||address.address_line}<br/>{address.city}, {address.state} {address.pincode||address.postal_code}<br/>{order.phone}</p></section>
      <section className="account-panel"><h3>Payment</h3><p>{order.payment_method} · {order.payment_status.replaceAll('_',' ')}</p>{latestPayment&&<small>Reference: {latestPayment.provider} · {latestPayment.status}</small>}</section>
      <section className="account-panel"><h3>Shipment</h3>{order.tracking_number?<p>{order.courier||'Carrier'} · {trackingUrl?<a href={trackingUrl} rel="noreferrer" target="_blank">{order.tracking_number}</a>:order.tracking_number}</p>:<p>Tracking details are not available yet.</p>}</section>
    </div>
    {requests&&requests.length>0&&<section className="account-panel"><h3>Order requests</h3>{requests.map(request=><p key={request.id}>{request.request_type} request · {request.status}</p>)}</section>}
    <OrderRequestForm orderId={order.id} fulfillmentStatus={order.fulfillment_status}/>
  </>;
}

function Status({value}:{value:string}){return <span className={`status-badge status-${value}`}>{value.replaceAll('_',' ')}</span>}
