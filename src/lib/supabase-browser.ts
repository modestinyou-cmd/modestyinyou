'use client';
import {createBrowserClient} from '@supabase/ssr';
import {getSupabasePublishableKey,getSupabaseUrl} from '@/lib/supabase-config';

export function createBrowserSupabaseClient(){
  const url=getSupabaseUrl();
  const publishableKey=getSupabasePublishableKey();
  if(!url||!publishableKey) throw new Error('Supabase Auth is not configured.');
  return createBrowserClient(url,publishableKey);
}
