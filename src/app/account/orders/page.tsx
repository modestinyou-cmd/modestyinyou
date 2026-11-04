import Link from 'next/link';
import Image from 'next/image';
import {requireCustomer} from '@/lib/account';
import {formatINR} from '@/lib/catalog';

export default async function OrdersPage(){
  const {supabase,user}=await requireCustomer('/account/orders');
  const {data:orders,error}=await supabase.from('orders').select('id,order_number,created_at,total_paise,payment_status,fulfillment_status').eq('user_id',user.id).order('created_at',{ascending:false});
  if(error) throw new Error('Order history could not be loaded.');
  const ids=(orders||[]).map(order=>order.id);
  const {data:items,error:itemsError}=ids.length?await supabase.from('order_items').select('order_id,product_name_snapshot,variant_name_snapshot,quantity,image_path').in('order_id',ids):{data:[],error:null};
  if(itemsError) throw new Error('Order item history could not be loaded.');
  return <>
    <div className="account-section-heading"><span className="eyebrow">Your purchases</span><h2>Order history</h2></div>
    {!orders?.length?<div className="empty-state"><h3>No orders yet</h3><p>Your order history will appear here after an order is placed.</p><Link className="button button-dark" href="/collections">Explore the collection</Link></div>:<div className="order-history">
      {orders.map(order=>{
        const orderItems=(items||[]).filter(item=>item.order_id===order.id);
        return <article className="order-card" key={order.id}>
          <div className="order-card-heading"><div><span className="eyebrow">Order</span><h3>{order.order_number}</h3><p>{new Date(order.created_at).toLocaleDateString('en-IN',{dateStyle:'long'})}</p></div><div className="order-statuses"><Status value={order.payment_status}/><Status value={order.fulfillment_status}/></div></div>
          <div className="order-card-items">{orderItems.map(item=><div className="order-item-preview" key={`${order.id}-${item.product_name_snapshot}`}>
            {item.image_path?.startsWith('/')&&<Image src={item.image_path} alt="" width={64} height={78}/>}
            <div><strong>{item.product_name_snapshot}</strong><small>{item.variant_name_snapshot} · Qty {item.quantity}</small></div>
          </div>)}</div>
          <div className="order-card-footer"><strong>{formatINR(order.total_paise)}</strong><Link className="text-link" href={`/account/orders/${order.id}`}>View details</Link></div>
        </article>;
      })}
    </div>}
  </>;
}

function Status({value}:{value:string}){return <span className={`status-badge status-${value}`}>{value.replaceAll('_',' ')}</span>}
