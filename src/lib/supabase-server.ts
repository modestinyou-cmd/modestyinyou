import {createServerClient,type CookieOptions} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {getSupabasePublishableKey,getSupabaseUrl} from '@/lib/supabase-config';

export function createServerSupabaseClient(){
  const cookieStore=cookies();
  const url=getSupabaseUrl();
  const publishableKey=getSupabasePublishableKey();
  if(!url||!publishableKey) throw new Error('Supabase Auth is not configured.');

  return createServerClient(url,publishableKey,{
    cookies:{
      get(name:string){return cookieStore.get(name)?.value;},
      // Server Components cannot write refreshed cookies; middleware refreshes sessions on protected routes.
      set(name:string,value:string,options:CookieOptions){try{cookieStore.set({name,value,...options});}catch{}},
      remove(name:string,options:CookieOptions){try{cookieStore.set({name,value:'',...options});}catch{}},
    },
  });
}
