'use client';
import {useEffect,useState,useCallback} from 'react';
import Link from 'next/link';
import {formatINR} from '@/lib/catalog';

type Order={id:string;order_number:string;customer_name:string;email:string;total_paise:number;payment_status:string;fulfillment_status:string;payment_method:string;created_at:string;item_count:number};

const PAY_LABELS:Record<string,string>={pending:'Pending',cod_pending:'COD Pending',authorized:'Authorized',paid:'Paid',failed:'Failed',refunded:'Refunded'};
const FUL_LABELS:Record<string,string>={pending:'Unfulfilled',confirmed:'Confirmed',processing:'Processing',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled',returned:'Returned'};

function payBadgeClass(s:string){return s==='paid'?'badge-success':s==='failed'||s==='refunded'?'badge-error':'badge-warn';}
function fulBadgeClass(s:string){return s==='delivered'?'badge-success':s==='cancelled'||s==='returned'?'badge-error':s==='shipped'?'badge-info':'badge-warn';}

export default function AdminOrders(){
  const [orders,setOrders]=useState<Order[]>([]);
  const [total,setTotal]=useState(0);
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [search,setSearch]=useState('');
  const [payFilter,setPayFilter]=useState('');
  const [fulFilter,setFulFilter]=useState('');
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');

  const load=useCallback(async()=>{
    setLoading(true);setError('');
    const params=new URLSearchParams({page:String(page)});
    if(search) params.set('search',search);
    if(payFilter) params.set('payment_status',payFilter);
    if(fulFilter) params.set('fulfillment_status',fulFilter);
    if(from) params.set('from',from);
    if(to) params.set('to',to);
    try{
      const res=await fetch(`/api/admin/orders?${params}`);
      if(res.status===401){setError('Session expired. Please sign in again.');setLoading(false);return;}
      const data=await res.json();
      if(!res.ok){setError(data.error||'Failed to load orders.');setLoading(false);return;}
      setOrders(data.orders);setTotal(data.total);
    }catch{setError('Network error.');}
    setLoading(false);
  },[page,search,payFilter,fulFilter,from,to]);

  useEffect(()=>{load();},[load]);

  const totalPages=Math.ceil(total/20);

  function fmt(d:string){
    return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }

  return(
    <>
      <h1 className="page-title" style={{marginBottom:16}}>Orders</h1>
      <div className="admin-filters">
        <input className="admin-search" placeholder="Search order, name, email, phone…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        <select value={payFilter} onChange={e=>{setPayFilter(e.target.value);setPage(1);}}>
          <option value="">All payment statuses</option>
          {Object.entries(PAY_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
        <select value={fulFilter} onChange={e=>{setFulFilter(e.target.value);setPage(1);}}>
          <option value="">All fulfilment statuses</option>
          {Object.entries(FUL_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
        <input type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(1);}} title="From date"/>
        <input type="date" value={to} onChange={e=>{setTo(e.target.value);setPage(1);}} title="To date"/>
      </div>
      {error&&<div className="notice" role="alert">{error}</div>}
      {loading?(
        <div className="admin-loading">Loading orders…</div>
      ):orders.length===0?(
        <div className="empty-state"><h2>No orders found</h2><p>Try adjusting your filters.</p></div>
      ):(
        <>
          <p className="admin-count">{total} order{total!==1?'s':''}</p>
          <div className="table-wrap">
            <table className="admin-table">
              <thead><tr>
                <th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Fulfilment</th><th></th>
              </tr></thead>
              <tbody>
                {orders.map(o=>(
                  <tr key={o.id}>
                    <td><span className="admin-order-num">{o.order_number}</span></td>
                    <td style={{whiteSpace:'nowrap'}}>{fmt(o.created_at)}</td>
                    <td><div>{o.customer_name}</div><div className="admin-sub">{o.email}</div></td>
                    <td>{o.item_count}</td>
                    <td style={{whiteSpace:'nowrap'}}>{formatINR(o.total_paise)}</td>
                    <td><span className={`badge ${payBadgeClass(o.payment_status)}`}>{PAY_LABELS[o.payment_status]||o.payment_status}</span></td>
                    <td><span className={`badge ${fulBadgeClass(o.fulfillment_status)}`}>{FUL_LABELS[o.fulfillment_status]||o.fulfillment_status}</span></td>
                    <td><Link href={`/admin/orders/${o.id}`} className="admin-view-link">View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages>1&&(
            <div className="admin-pagination">
              <button className="button button-outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button className="button button-outline" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </>
  );
}