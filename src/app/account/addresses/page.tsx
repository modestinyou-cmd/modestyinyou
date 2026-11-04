import {requireCustomer} from '@/lib/account';
import {AddressBook} from '@/components/AccountForms';

export default async function AddressesPage(){
  const {supabase,user}=await requireCustomer('/account/addresses');
  const {data,error}=await supabase.from('customer_addresses').select('*').eq('user_id',user.id).order('is_default',{ascending:false}).order('created_at',{ascending:false});
  if(error) throw new Error('Saved addresses could not be loaded.');
  return <>
    <div className="account-section-heading"><span className="eyebrow">Delivery details</span><h2>Address book</h2><p>Addresses are private to your account and can be reused when checkout is connected.</p></div>
    <AddressBook initialAddresses={data||[]}/>
  </>;
}
