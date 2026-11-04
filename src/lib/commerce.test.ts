import {describe,it,expect} from 'vitest';import {calculateShipping,calculateSubtotal,validQuantity,variantAvailable} from './commerce';
describe('commerce calculations',()=>{
 it('calculates subtotal in integer paise',()=>expect(calculateSubtotal([{unitPricePaise:129900,quantity:2},{unitPricePaise:49900,quantity:1}])).toBe(309700));
 it('returns configurable flat shipping only for a nonempty cart',()=>{expect(calculateShipping(0)).toBe(0);expect(calculateShipping(10000,5000)).toBe(5000)});
 it('limits cart quantity to positive whole numbers up to ten',()=>{expect(validQuantity(1)).toBe(true);expect(validQuantity(10)).toBe(true);expect(validQuantity(0)).toBe(false);expect(validQuantity(1.5)).toBe(false);expect(validQuantity(11)).toBe(false)});
 it('checks selected variant availability',()=>{expect(variantAvailable(4,3)).toBe(true);expect(variantAvailable(2,3)).toBe(false);expect(variantAvailable(4,0)).toBe(false)});
});
