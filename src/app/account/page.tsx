import Link from 'next/link';
import {requireCustomer} from '@/lib/account';
import {formatINR} from '@/lib/catalog';

export default async function AccountOverview(){
  const {supabase,user}=await requireCustomer('/account');
  const [{data:orders,error:ordersError},{data:addresses,error:addressesError},{data:wishlist,error:wishlistError}]=await Promise.all([
    supabase.from('orders').select('id,order_number,created_at,total_paise,payment_status,fulfillment_status').eq('user_id',user.id).order('created_at',{ascending:false}),
    supabase.from('customer_addresses').select('id').eq('user_id',user.id),
    supabase.from('wishlist_items').select('id').eq('user_id',user.id),
  ]);
  if(ordersError||addressesError||wishlistError) throw new Error('Your account data could not be loaded.');
  const customerOrders=orders||[];
  const processing=customerOrders.filter(order=>['confirmed','processing'].includes(order.fulfillment_status)).length;
  const shipped=customerOrders.filter(order=>['shipped','delivered'].includes(order.fulfillment_status)).length;
  const recent=customerOrders.slice(0,3);
  const orderIds=recent.map(order=>order.id);
  const {data:payments,error:paymentsError}=orderIds.length
    ?await supabase.from('payments').select('id,order_id,status,amount_paise,created_at').in('order_id',orderIds).order('created_at',{ascending:false}).limit(3)
    :{data:[],error:null};
  if(paymentsError) throw new Error('Payment activity could not be loaded.');
  return <>
    <div className="account-section-heading"><span className="eyebrow">Your overview</span><h2>Welcome back</h2><p>Your orders, saved details and account information in one place.</p></div>
    <div className="account-stats">
      <Stat label="Total orders" value={customerOrders.length}/>
      <Stat label="Processing" value={processing}/>
      <Stat label="Shipped or delivered" value={shipped}/>
      <Stat label="Saved pieces" value={wishlist?.length||0}/>
    </div>
    <div className="account-overview-grid">
      <section className="account-panel">
        <div className="account-panel-heading"><h2>Recent orders</h2><Link href="/account/orders">View all</Link></div>
        {recent.length?recent.map(order=><div className="account-list-row" key={order.id}>
          <div><Link href={`/account/orders/${order.id}`}><strong>{order.order_number}</strong></Link><small>{new Date(order.created_at).toLocaleDateString('en-IN',{dateStyle:'medium'})}</small></div>
          <div><Status value={order.fulfillment_status}/><strong>{formatINR(order.total_paise)}</strong></div>
        </div>):<p className="muted">You have not placed any orders yet.</p>}
      </section>
      <section className="account-panel">
        <div className="account-panel-heading"><h2>Payment activity</h2><Link href="/account/payments">View all</Link></div>
        {payments?.length?payments.map(payment=><div className="account-list-row" key={payment.id}>
          <div><strong>{payment.status.replaceAll('_',' ')}</strong><small>{new Date(payment.created_at).toLocaleDateString('en-IN',{dateStyle:'medium'})}</small></div>
          <strong>{formatINR(payment.amount_paise)}</strong>
        </div>):<p className="muted">No payment activity is recorded.</p>}
      </section>
      <section className="account-panel">
        <div className="account-panel-heading"><h2>Saved addresses</h2><Link href="/account/addresses">Manage</Link></div>
        <p>{addresses?.length?`${addresses.length} saved ${addresses.length===1?'address':'addresses'}`:'No address saved yet.'}</p>
      </section>
      <section className="account-panel">
        <div className="account-panel-heading"><h2>Need a hand?</h2><Link href="/contact">Contact us</Link></div>
        <p>For an order question, open the order details to find the relevant support options.</p>
      </section>
    </div>
  </>;
}

function Stat({label,value}:{label:string;value:number}){return <div className="account-stat"><span>{label}</span><strong>{value}</strong></div>}
function Status({value}:{value:string}){return <span className={`status-badge status-${value}`}>{value.replaceAll('_',' ')}</span>}
