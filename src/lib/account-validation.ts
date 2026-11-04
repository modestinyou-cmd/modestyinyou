import {z} from 'zod';

export const profileSchema=z.object({
  full_name:z.string().trim().min(1).max(120),
  phone:z.string().trim().regex(/^[+0-9() -]{7,20}$/),
}).strict();

export const addressSchema=z.object({
  label:z.string().trim().min(1).max(40),
  recipient_name:z.string().trim().min(1).max(120),
  phone:z.string().trim().regex(/^[+0-9() -]{7,20}$/),
  address_line:z.string().trim().min(4).max(240),
  city:z.string().trim().min(1).max(100),
  state:z.string().trim().min(1).max(100),
  postal_code:z.string().trim().regex(/^\d{6}$/,'Enter a valid 6-digit Indian PIN code.'),
  country:z.literal('India').default('India'),
  is_default:z.boolean().default(false),
}).strict();

export const checkoutSchema=z.object({
  name:z.string().trim().min(1).max(120),
  email:z.string().trim().email().max(254),
  phone:z.string().trim().regex(/^[+0-9() -]{7,20}$/),
  address:z.string().trim().min(4).max(240),
  city:z.string().trim().min(1).max(100),
  state:z.string().trim().min(1).max(100),
  pincode:z.string().trim().regex(/^\d{6}$/),
  payment_method:z.literal('cod').default('cod'),
  checkout_request_id:z.string().uuid().optional(),
  items:z.array(z.object({
    productId:z.string().min(1).max(120),
    variantId:z.string().min(1).max(120),
    quantity:z.number().int().min(1).max(10),
  }).strict()).min(1).max(50),
}).strict();

export const wishlistInputSchema=z.object({slug:z.string().trim().min(1).max(120)}).strict();
export const cancellationRequestSchema=z.object({
  request_type:z.literal('cancellation'),
  message:z.string().trim().max(1000).default(''),
}).strict();
