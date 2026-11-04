import {NextRequest,NextResponse} from 'next/server';
import {createServiceClient,isSupabaseServerConfigured} from '@/lib/supabase-service';
import {verifyPaymentSignature} from '@/lib/payment-signature';

type JsonRecord=Record<string,unknown>;

function isRecord(value:unknown):value is JsonRecord{
  return typeof value==='object'&&value!==null&&!Array.isArray(value);
}

export async function POST(request:NextRequest){
  const secret=process.env.PAYMENT_WEBHOOK_SECRET;
  if(!secret||!isSupabaseServerConfigured()){
    return NextResponse.json({error:'Payment webhook is not configured.'},{status:503});
  }
  const rawBody=await request.text();
  const signature=request.headers.get('x-razorpay-signature')||'';
  const eventId=request.headers.get('x-razorpay-event-id')||'';
  if(!verifyPaymentSignature(rawBody,signature,secret)) return NextResponse.json({error:'Invalid signature.'},{status:401});
  if(!eventId||eventId.length>200) return NextResponse.json({error:'Missing or invalid provider event ID.'},{status:400});

  let event:JsonRecord;
  try{
    const parsed:unknown=JSON.parse(rawBody);
    if(!isRecord(parsed)) throw new Error('Expected event object');
    event=parsed;
  }catch{
    return NextResponse.json({error:'Invalid event payload.'},{status:400});
  }
  const eventType=typeof event.event==='string'?event.event:'';
  if(!['payment.captured','payment.failed','refund.processed'].includes(eventType)){
    return NextResponse.json({received:true,processed:false});
  }

  const payload=isRecord(event.payload)?event.payload:{};
  let providerOrderId:string|null=null;
  let providerPaymentId:string|null=null;
  let providerObjectId:string|null=null;
  let amountPaise:number|null=null;
  if(eventType==='refund.processed'){
    const refundPart=isRecord(payload.refund)?payload.refund:{};
    const entity=isRecord(refundPart.entity)?refundPart.entity:{};
    providerObjectId=typeof entity.id==='string'?entity.id:null;
    providerPaymentId=typeof entity.payment_id==='string'?entity.payment_id:null;
    amountPaise=Number.isSafeInteger(entity.amount)?entity.amount as number:null;
  }else{
    const paymentPart=isRecord(payload.payment)?payload.payment:{};
    const entity=isRecord(paymentPart.entity)?paymentPart.entity:{};
    providerOrderId=typeof entity.order_id==='string'?entity.order_id:null;
    providerPaymentId=typeof entity.id==='string'?entity.id:null;
    amountPaise=Number.isSafeInteger(entity.amount)?entity.amount as number:null;
  }
  if(!providerPaymentId||amountPaise===null||amountPaise<0||
    (eventType==='refund.processed'&&!providerObjectId)||
    (eventType!=='refund.processed'&&!providerOrderId)){
    return NextResponse.json({error:'Payment event is missing required fields.'},{status:400});
  }

  const db=createServiceClient();
  const {data,error}=await db.rpc('process_razorpay_webhook',{
    p_event_id:eventId,
    p_event_type:eventType,
    p_provider_order_id:providerOrderId,
    p_provider_payment_id:providerPaymentId,
    p_provider_object_id:providerObjectId,
    p_amount_paise:amountPaise,
    p_payload:event,
  });
  if(error){
    console.error('Payment webhook processing failed:',error);
    return NextResponse.json({error:'Payment event could not be processed.'},{status:500});
  }
  if(data==='unmatched') return NextResponse.json({error:'Payment reference is not available yet.'},{status:409});
  return NextResponse.json({received:true,processed:data==='processed',duplicate:data==='duplicate'});
}
