import {requireCustomer} from '@/lib/account';
import {ProfileForm} from '@/components/AccountForms';

export default async function ProfilePage(){
  const {supabase,user}=await requireCustomer('/account/profile');
  const {data:profile,error}=await supabase.from('profiles').select('full_name,phone').eq('id',user.id).maybeSingle();
  if(error) throw new Error('Profile information could not be loaded.');
  return <>
    <div className="account-section-heading"><span className="eyebrow">Personal details</span><h2>Profile</h2><p>Update the name and phone number associated with your account.</p></div>
    <ProfileForm profile={{full_name:profile?.full_name||user.user_metadata?.full_name||'',phone:profile?.phone||'',email:user.email||''}}/>
  </>;
}
