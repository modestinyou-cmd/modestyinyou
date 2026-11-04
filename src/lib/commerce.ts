export function calculateSubtotal(items:{unitPricePaise:number;quantity:number}[]){return items.reduce((sum,item)=>sum+item.unitPricePaise*item.quantity,0)}
export function calculateShipping(subtotal:number, flatRate=7900){return subtotal===0?0:flatRate}
export function validQuantity(q:number){return Number.isInteger(q)&&q>0&&q<=10}
export function variantAvailable(stock:number,q:number){return stock>=q&&q>0}
