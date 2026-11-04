import {createServerClient,type CookieMethodsServer} from '@supabase/ssr';
import {NextResponse,type NextRequest} from 'next/server';
import {getSupabasePublishableKey,getSupabaseUrl} from '@/lib/supabase-config';

export async function middleware(request:NextRequest){
  const url=getSupabaseUrl();
  const publishableKey=getSupabasePublishableKey();
  if(!url||!publishableKey) return NextResponse.next({request});

  let response=NextResponse.next({request});
  const cookieMethods:CookieMethodsServer={
      getAll(){return request.cookies.getAll();},
      setAll(cookiesToSet){
        cookiesToSet.forEach(({name,value})=>request.cookies.set(name,value));
        response=NextResponse.next({request});
        cookiesToSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));
      },
  };
  const supabase=createServerClient(url,publishableKey,{cookies:cookieMethods});

  const {data:{user}}=await supabase.auth.getUser();
  if(request.nextUrl.pathname.startsWith('/account')&&!user){
    const loginUrl=request.nextUrl.clone();
    loginUrl.pathname='/login';
    loginUrl.search='';
    loginUrl.searchParams.set('next',`${request.nextUrl.pathname}${request.nextUrl.search}`);
    const redirectResponse=NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach(cookie=>redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }
  return response;
}

export const config={matcher:['/account/:path*','/auth/:path*']};
