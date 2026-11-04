import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import Link from 'next/link';
import {createClient} from '@supabase/supabase-js';
import {getSupabasePublishableKey,getSupabaseUrl} from '@/lib/supabase-config';
import {isConfiguredAdminEmail} from '@/lib/admin-auth';

async function getAdminOrRedirect(){
  // Skip auth check on login page (handled by pathname check in children)
  const cookieStore=cookies();
  const token=cookieStore.get('sb-access-token')?.value;
  if(!token) return null;
  const url=getSupabaseUrl();
  const publishableKey=getSupabasePublishableKey();
  if(!url||!publishableKey) return null;
  try{
    const client=createClient(url,publishableKey);
    const {data:{user}}=await client.auth.getUser(token);
    if(!user) return null;
    if(isConfiguredAdminEmail(user.email)) return user;
  }catch{}
  return null;
}

export default async function AdminLayout({children}:{children:React.ReactNode}){
  // Allow login page without auth
  // We can't easily get pathname in layout, so we protect via middleware-style check:
  // If no valid admin session and not on login page, redirect.
  // The login page itself is a child so we check the cookie here.
  const cookieStore=cookies();
  const token=cookieStore.get('sb-access-token')?.value;
  if(token){
    const admin=await getAdminOrRedirect();
    if(!admin) redirect('/admin/login');
  }

  return(
    <div className="admin-shell">
      <div className="admin-topbar">
        <span className="eyebrow">ModestyInYou · Administration</span>
        {token&&(
          <form action="/api/admin/logout" method="POST">
            <button className="admin-signout-btn" type="submit">Sign out</button>
          </form>
        )}
      </div>
      <nav className="admin-nav">
        <Link href="/admin">Overview</Link>
        <Link href="/admin/orders">Orders</Link>
        <Link href="/admin/products">Products</Link>
      </nav>
      {children}
    </div>
  );
}
