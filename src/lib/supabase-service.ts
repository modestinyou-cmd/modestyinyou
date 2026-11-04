import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {getSupabaseUrl} from '@/lib/supabase-config';

function getSupabaseSecretKey(){
  return process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||null;
}

export function isSupabaseServerConfigured(){
  return Boolean(getSupabaseUrl()&&getSupabaseSecretKey());
}

export function createServiceClient(){
  const url=getSupabaseUrl();
  const secretKey=getSupabaseSecretKey();
  if(!url||!secretKey){
    throw new Error('Supabase server configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.');
  }
  return createClient(url,secretKey,{auth:{autoRefreshToken:false,persistSession:false}});
}
