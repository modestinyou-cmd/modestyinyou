'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useParams} from 'next/navigation';
import {formatINR} from '@/lib/catalog';
import type {Order,OrderItem,Payment} from '@/lib/supabase';

type Event={id:string;event_type:string;payload:Record<string,unknown>;created_at:string};
type OrderRequest={id:string;request_type:string;message:string;status:string;created_at:string};

const PAY_LABELS:Record<string,string>={pending:'Pending',cod_pending:'COD Pending',authorized:'Authorized',paid:'Paid',failed:'Failed',partially_refunded:'Partially refunded',refunded:'Refunded'};
const FUL_LABELS:Record<string,string>={pending:'Unfulfilled',confirmed:'Confirmed',processing:'Processing',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled',returned:'Returned'};
const FUL_OPTIONS=['pending','confirmed','processing','shipped','delivered','cancelled','returned'];

function payBadgeClass(s:string){return s==='paid'?'badge-success':s==='failed'||s==='refunded'?'badge-error':'badge-warn';}
function fulBadgeClass(s:string){return s==='delivered'?'badge-success':s==='cancelled'||s==='returned'?'badge-error':s==='shipped'?'badge-info':'badge-warn';}

export default function AdminOrderDetail(){
  const {id}=useParams<{id:string}>();
  const [order,setOrder]=useState<Order|null>(null);
  const [items,setItems]=useState<OrderItem[]>([]);
  const [payments,setPayments]=useState<Payment[]>([]);
  const [events,setEvents]=useState<Event[]>([]);
  const [requests,setRequests]=useState<OrderRequest[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);
  const [saveMsg,setSaveMsg]=useState('');

  // Fulfillment form state
  const [fulStatus,setFulStatus]=useState('');
  const [courier,setCourier]=useState('');
  const [tracking,setTracking]=useState('');
  const [trackingUrl,setTrackingUrl]=useState('');
  const [notes,setNotes]=useState('');

  useEffect(()=>{
    fetch(`/api/admin/orders/${id}`)
      .then(r=>r.json())
      .then(d=>{
        if(d.error){setError(d.error);setLoading(false);return;}
        setOrder(d.order);setItems(d.items);setPayments(d.payments);setEvents(d.events);setRequests(d.requests||[]);
        setFulStatus(d.order.fulfillment_status);
        setCourier(d.order.courier||'');
        setTracking(d.order.tracking_number||'');
        setTrackingUrl(d.order.tracking_url||'');
        setNotes(d.order.notes||'');
        setLoading(false);
      })
      .catch(()=>{setError('Failed to load order.');setLoading(false);});
  },[id]);

  async function saveShipping(e:React.FormEvent){
    e.preventDefault();setSaving(true);setSaveMsg('');
    const res=await fetch(`/api/admin/orders/${id}`,{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({fulfillment_status:fulStatus,courier,tracking_number:tracking,tracking_url:trackingUrl,notes}),
    });
    const data=await res.json();
    if(res.ok){setSaveMsg('Saved.');setOrder(o=>o?{...o,fulfillment_status:fulStatus as Order['fulfillment_status'],courier,tracking_number:tracking,tracking_url:trackingUrl,notes}:o);}
    else setSaveMsg(data.error||'Save failed.');
    setSaving(false);
  }

  function fmtDate(d:string){return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});}

  if(loading) return <div className="admin-loading">Loading order…</div>;
  if(error||!order) return <div className="notice" role="alert">{error||'Order not found.'}</div>;

  const addr=order.shipping_address as Record<string,string>;

  return(
    <>
      <p className="breadcrumbs"><Link href="/admin/orders">Orders</Link> / {order.order_number}</p>
      <div className="admin-order-header">
        <div>
          <h1 className="page-title" style={{marginBottom:4}}>{order.order_number}</h1>
          <p style={{fontSize:12,color:'#5a4a40',margin:0}}>{fmtDate(order.created_at)}</p>
        </div>
        <div className="admin-order-badges">
          <span className={`badge ${payBadgeClass(order.payment_status)}`}>{PAY_LABELS[order.payment_status]||order.payment_status}</span>
          <span className={`badge ${fulBadgeClass(order.fulfillment_status)}`}>{FUL_LABELS[order.fulfillment_status]||order.fulfillment_status}</span>
        </div>
      </div>

      <div className="admin-order-grid">
        {/* Customer */}
        <section className="admin-card">
          <h2 className="admin-card-title">Customer</h2>
          <dl className="admin-dl">
            <dt>Name</dt><dd>{order.customer_name}</dd>
            <dt>Email</dt><dd>{order.email}</dd>
            <dt>Phone</dt><dd>{order.phone}</dd>
            <dt>Address</dt><dd>{addr.address}, {addr.city}, {addr.state} – {addr.pincode}</dd>
          </dl>
        </section>

        {/* Payment summary */}
        <section className="admin-card">
          <h2 className="admin-card-title">Payment</h2>
          <dl className="admin-dl">
            <dt>Method</dt><dd style={{textTransform:'capitalize'}}>{order.payment_method}</dd>
            <dt>Status</dt><dd><span className={`badge ${payBadgeClass(order.payment_status)}`}>{PAY_LABELS[order.payment_status]||order.payment_status}</span></dd>
            <dt>Subtotal</dt><dd>{formatINR(order.subtotal_paise)}</dd>
            {order.discount_paise>0&&<><dt>Discount</dt><dd>−{formatINR(order.discount_paise)}</dd></>}
            <dt>Shipping</dt><dd>{formatINR(order.shipping_paise)}</dd>
            {order.tax_paise>0&&<><dt>Tax</dt><dd>{formatINR(order.tax_paise)}</dd></>}
            <dt>Total</dt><dd style={{fontWeight:600}}>{formatINR(order.total_paise)}</dd>
          </dl>
          {payments.map(p=>(
            <div key={p.id} className="admin-payment-row">
              {p.provider_payment_id&&<><dt>Transaction ref</dt><dd style={{fontFamily:'monospace',fontSize:11}}>{p.provider_payment_id}</dd></>}
              {p.confirmed_at&&<><dt>Confirmed</dt><dd>{fmtDate(p.confirmed_at)}</dd></>}
              {p.refund_amount_paise>0&&<><dt>Refunded</dt><dd>{formatINR(p.refund_amount_paise)}</dd></>}
            </div>
          ))}
        </section>

        {/* Order items */}
        <section className="admin-card admin-card-full">
          <h2 className="admin-card-title">Items ordered</h2>
          <div className="table-wrap">
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Variant</th><th>SKU</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead>
              <tbody>
                {items.map(item=>(
                  <tr key={item.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        {item.image_path&&<Image src={item.image_path} alt={item.product_name_snapshot} width={40} height={48} style={{objectFit:'cover',background:'var(--ivory)'}}/>}
                        {item.product_name_snapshot}
                      </div>
                    </td>
                    <td>{item.variant_name_snapshot}</td>
                    <td style={{fontFamily:'monospace',fontSize:11}}>{item.sku_snapshot}</td>
                    <td>{item.quantity}</td>
                    <td>{formatINR(item.unit_price_paise)}</td>
                    <td style={{fontWeight:600}}>{formatINR(item.line_total_paise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {requests.length>0&&<section className="admin-card admin-card-full">
          <h2 className="admin-card-title">Customer order requests</h2>
          <div className="table-wrap"><table className="admin-table"><thead><tr><th>Type</th><th>Status</th><th>Received</th><th>Customer note</th></tr></thead><tbody>
            {requests.map(request=><tr key={request.id}><td>{request.request_type}</td><td>{request.status}</td><td>{fmtDate(request.created_at)}</td><td>{request.message||'—'}</td></tr>)}
          </tbody></table></div>
        </section>}

        {/* Fulfillment update */}
        <section className="admin-card admin-card-full">
          <h2 className="admin-card-title">Shipping &amp; fulfilment</h2>
          <form onSubmit={saveShipping} className="admin-fulfillment-form">
            <label className="form-field">
              Fulfilment status
              <select value={fulStatus} onChange={e=>setFulStatus(e.target.value)}>
                {FUL_OPTIONS.map(s=><option key={s} value={s}>{FUL_LABELS[s]}</option>)}
              </select>
            </label>
            <label className="form-field">
              Courier
              <input value={courier} onChange={e=>setCourier(e.target.value)} placeholder="e.g. Delhivery"/>
            </label>
            <label className="form-field">
              Tracking number
              <input value={tracking} onChange={e=>setTracking(e.target.value)}/>
            </label>
            <label className="form-field">
              Tracking URL
              <input value={trackingUrl} onChange={e=>setTrackingUrl(e.target.value)} type="url" placeholder="https://…"/>
            </label>
            <label className="form-field" style={{gridColumn:'1/-1'}}>
              Notes
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3}/>
            </label>
            <div style={{gridColumn:'1/-1',display:'flex',alignItems:'center',gap:16}}>
              <button className="button button-dark" disabled={saving}>{saving?'Saving…':'Save changes'}</button>
              {saveMsg&&<span style={{fontSize:12,color:saveMsg==='Saved.'?'#3d5c35':'var(--espresso)'}}>{saveMsg}</span>}
            </div>
          </form>
        </section>

        {/* Audit log */}
        {events.length>0&&(
          <section className="admin-card admin-card-full">
            <h2 className="admin-card-title">Activity log</h2>
            <div className="table-wrap">
              <table className="admin-table">
                <thead><tr><th>Time</th><th>Event</th><th>Details</th></tr></thead>
                <tbody>
                  {events.map(ev=>(
                    <tr key={ev.id}>
                      <td style={{whiteSpace:'nowrap',fontSize:11}}>{fmtDate(ev.created_at)}</td>
                      <td style={{fontFamily:'monospace',fontSize:11}}>{ev.event_type}</td>
                      <td style={{fontSize:11,color:'#5a4a40'}}>{JSON.stringify(ev.payload)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
