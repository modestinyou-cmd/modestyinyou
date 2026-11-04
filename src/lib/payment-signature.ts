import {createHmac,timingSafeEqual} from 'crypto';

export function verifyPaymentSignature(body:string,signature:string,secret:string){
  if(!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected=createHmac('sha256',secret).update(body).digest();
  const supplied=Buffer.from(signature,'hex');
  return supplied.length===expected.length&&timingSafeEqual(expected,supplied);
}
