import {NextRequest,NextResponse} from 'next/server';
import {safeInternalPath} from '@/lib/account-path';
import {createServerSupabaseClient} from '@/lib/supabase-server';

export async function GET(request:NextRequest){
  const url=new URL(request.url);
  const code=url.searchParams.get('code');
  const destination=safeInternalPath(url.searchParams.get('next'));
  if(!code) return NextResponse.redirect(new URL('/login?error=verification',url.origin));
  const supabase=createServerSupabaseClient();
  const {error}=await supabase.auth.exchangeCodeForSession(code);
  if(error) return NextResponse.redirect(new URL('/login?error=verification',url.origin));
  return NextResponse.redirect(new URL(destination,url.origin));
}
