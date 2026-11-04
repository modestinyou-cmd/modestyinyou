import Link from 'next/link';
import {requireCustomer} from '@/lib/account';
import {formatINR} from '@/lib/catalog';

export default async function PaymentsPage(){
  const {supabase,user}=await requireCustomer('/account/payments');
  const {data:orders,error:ordersError}=await supabase.from('orders').select('id,order_number').eq('user_id',user.id);
  if(ordersError) throw new Error('Payment activity could not be loaded.');
  const ids=(orders||[]).map(order=>order.id);
  const {data:payments,error}=ids.length
    ?await supabase.from('payments').select('id,order_id,provider,provider_payment_id,status,amount_paise,refund_amount_paise,created_at').in('order_id',ids).order('created_at',{ascending:false})
    :{data:[],error:null};
  if(error) throw new Error('Payment activity could not be loaded.');
  const orderMap=new Map((orders||[]).map(order=>[order.id,order.order_number]));
  return <>
    <div className="account-section-heading"><span className="eyebrow">Payment activity</span><h2>Payments</h2><p>Only payment records associated with your orders are shown.</p></div>
    {payments?.length?<div className="account-table-wrap"><table className="account-table"><thead><tr><th>Reference</th><th>Order</th><th>Date</th><th>Method</th><th>Status</th><th>Amount</th><th>Refund</th></tr></thead><tbody>
      {payments.map(payment=><tr key={payment.id}><td>{payment.provider_payment_id||payment.id.slice(0,8)}</td><td><Link href={`/account/orders/${payment.order_id}`}>{orderMap.get(payment.order_id)||'Order details'}</Link></td><td>{new Date(payment.created_at).toLocaleDateString('en-IN')}</td><td>{payment.provider}</td><td><span className={`status-badge status-${payment.status}`}>{payment.status.replaceAll('_',' ')}</span></td><td>{formatINR(payment.amount_paise)}</td><td>{payment.refund_amount_paise?formatINR(payment.refund_amount_paise):'—'}</td></tr>)}
    </tbody></table></div>:<div className="empty-state"><h3>No payment history</h3><p>Payment records will appear when they are created for one of your orders.</p></div>}
    <p className="muted account-payment-note">Online payment initiation and retries are unavailable until a verified payment provider is configured.</p>
  </>;
}
