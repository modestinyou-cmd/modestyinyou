import {createHmac} from 'crypto';
import {describe,it,expect} from 'vitest';
import {verifyPaymentSignature} from './payment-signature';

describe('payment webhook signature verification',()=>{
  it('accepts the exact HMAC-SHA256 signature',()=>{
    const body='{"event":"payment.captured"}';
    const signature=createHmac('sha256','test-secret').update(body).digest('hex');
    expect(verifyPaymentSignature(body,signature,'test-secret')).toBe(true);
  });
  it('rejects altered payloads, incorrect secrets, and malformed signatures',()=>{
    const body='{"event":"payment.captured"}';
    const signature=createHmac('sha256','test-secret').update(body).digest('hex');
    expect(verifyPaymentSignature(`${body} `,signature,'test-secret')).toBe(false);
    expect(verifyPaymentSignature(body,signature,'wrong-secret')).toBe(false);
    expect(verifyPaymentSignature(body,'invalid','test-secret')).toBe(false);
  });
});
