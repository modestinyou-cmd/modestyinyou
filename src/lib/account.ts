import {redirect} from 'next/navigation';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {getSupabasePublishableKey,getSupabaseUrl} from '@/lib/supabase-config';
export {safeInternalPath} from '@/lib/account-path';

export async function requireCustomer(destination:string){
  if(!getSupabaseUrl()||!getSupabasePublishableKey()){
    redirect(`/login?error=configuration&next=${encodeURIComponent(destination)}`);
  }
  const supabase=createServerSupabaseClient();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user){
    redirect(`/login?next=${encodeURIComponent(destination)}`);
  }
  return {supabase,user};
}
