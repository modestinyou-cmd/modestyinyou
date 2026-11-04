import {describe,it,expect} from 'vitest';
import {addressSchema,cancellationRequestSchema,checkoutSchema,profileSchema,wishlistInputSchema} from './account-validation';

const validAddress={
  label:'Home',recipient_name:'A Customer',phone:'+91 98765 43210',
  address_line:'10 Example Road',city:'Mumbai',state:'Maharashtra',postal_code:'400001',
};

describe('customer account validation',()=>{
  it('requires a nonempty profile name and a phone number',()=>{
    expect(profileSchema.safeParse({full_name:'A Customer',phone:'9876543210'}).success).toBe(true);
    expect(profileSchema.safeParse({full_name:'',phone:'bad'}).success).toBe(false);
    expect(profileSchema.safeParse({full_name:'A Customer',phone:'9876543210',role:'admin'}).success).toBe(false);
  });
  it('accepts Indian PIN codes and rejects malformed codes',()=>{
    expect(addressSchema.safeParse(validAddress).success).toBe(true);
    expect(addressSchema.safeParse({...validAddress,postal_code:'1234'}).success).toBe(false);
    expect(addressSchema.safeParse({...validAddress,user_id:'someone-else'}).success).toBe(false);
  });
  it('limits checkout to server-supported COD and safe quantities',()=>{
    const order={
      name:'A Customer',email:'customer@example.com',phone:'9876543210',
      address:'10 Example Road',city:'Mumbai',state:'Maharashtra',pincode:'400001',
      payment_method:'cod',items:[{productId:'p1',variantId:'v1',quantity:2}],
    };
    expect(checkoutSchema.safeParse(order).success).toBe(true);
    expect(checkoutSchema.safeParse({...order,payment_method:'online'}).success).toBe(false);
    expect(checkoutSchema.safeParse({...order,items:[{...order.items[0],quantity:11}]}).success).toBe(false);
    expect(checkoutSchema.safeParse({...order,total_paise:1}).success).toBe(false);
  });
  it('validates wishlist slugs and rejects customer-supplied approval status',()=>{
    expect(wishlistInputSchema.safeParse({slug:'sage-veil'}).success).toBe(true);
    expect(cancellationRequestSchema.safeParse({request_type:'cancellation',status:'approved'}).success).toBe(false);
  });
});
