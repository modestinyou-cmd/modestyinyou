import Link from 'next/link';
import {createServiceClient} from '@/lib/supabase-service';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

// Re-export formatINR from catalog for server components
import {formatINR as fmt} from '@/lib/catalog';

async function getStats(){
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try{
    const db=createServiceClient();
    const {data:orders}=await db.from('orders').select('payment_status,fulfillment_status,total_paise');
    if(!orders) return null;
    const total=orders.length;
    const awaitingPayment=orders.filter(o=>o.payment_status==='pending'||o.payment_status==='cod_pending').length;
    const paid=orders.filter(o=>o.payment_status==='paid').length;
    const processing=orders.filter(o=>o.fulfillment_status==='processing'||o.fulfillment_status==='confirmed').length;
    const shipped=orders.filter(o=>o.fulfillment_status==='shipped').length;
    const delivered=orders.filter(o=>o.fulfillment_status==='delivered').length;
    const cancelled=orders.filter(o=>o.fulfillment_status==='cancelled'||o.payment_status==='refunded').length;
    const revenue=orders.filter(o=>o.payment_status==='paid').reduce((s,o)=>s+o.total_paise,0);
    return {total,awaitingPayment,paid,processing,shipped,delivered,cancelled,revenue};
  }catch{return null;}
}

export default async function AdminDashboard(){
  const cookieStore=cookies();
  const token=cookieStore.get('sb-access-token')?.value;
  if(!token) redirect('/admin/login');

  const stats=await getStats();

  return(
    <>
      <h1 className="page-title" style={{marginBottom:8}}>Overview</h1>
      {!process.env.NEXT_PUBLIC_SUPABASE_URL&&(
        <div className="notice">Supabase is not configured. Connect your project to see live order data.</div>
      )}
      {stats?(
        <div className="admin-stats-grid">
          <StatCard label="Total orders" value={stats.total} href="/admin/orders"/>
          <StatCard label="Awaiting payment" value={stats.awaitingPayment} href="/admin/orders?payment_status=pending"/>
          <StatCard label="Paid" value={stats.paid} href="/admin/orders?payment_status=paid"/>
          <StatCard label="Processing" value={stats.processing} href="/admin/orders?fulfillment_status=confirmed"/>
          <StatCard label="Shipped" value={stats.shipped} href="/admin/orders?fulfillment_status=shipped"/>
          <StatCard label="Delivered" value={stats.delivered} href="/admin/orders?fulfillment_status=delivered"/>
          <StatCard label="Cancelled / Refunded" value={stats.cancelled} href="/admin/orders?fulfillment_status=cancelled"/>
          <StatCard label="Total revenue" value={fmt(stats.revenue)} href="/admin/orders?payment_status=paid" highlight/>
        </div>
      ):(
        <div className="admin-stats-grid">
          {['Total orders','Awaiting payment','Paid','Processing','Shipped','Delivered','Cancelled','Revenue'].map(l=>(
            <div key={l} className="admin-stat-card"><span className="eyebrow">{l}</span><div className="admin-stat-value admin-stat-empty">—</div></div>
          ))}
        </div>
      )}
    </>
  );
}

function StatCard({label,value,href,highlight=false}:{label:string;value:string|number;href:string;highlight?:boolean}){
  return(
    <Link href={href} className={`admin-stat-card${highlight?' admin-stat-highlight':''}`}>
      <span className="eyebrow">{label}</span>
      <div className="admin-stat-value">{value}</div>
    </Link>
  );
}
