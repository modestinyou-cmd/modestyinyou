import Link from 'next/link';
import {requireCustomer} from '@/lib/account';
import {CustomerLogoutButton} from '@/components/CustomerAuthForm';

export const dynamic='force-dynamic';

const links=[
  {href:'/account',label:'Overview'},
  {href:'/account/profile',label:'Profile'},
  {href:'/account/orders',label:'Orders'},
  {href:'/account/payments',label:'Payments'},
  {href:'/account/addresses',label:'Addresses'},
  {href:'/account/wishlist',label:'Wishlist'},
  {href:'/account/security',label:'Security'},
];

export default async function AccountLayout({children}:{children:React.ReactNode}){
  const {supabase,user}=await requireCustomer('/account');
  const {data:profile}=await supabase.from('profiles').select('full_name').eq('id',user.id).maybeSingle();
  const name=profile?.full_name||user.user_metadata?.full_name||user.email||'Your account';
  return <div className="page-shell account-shell">
    <div className="account-heading">
      <div><span className="eyebrow">Personal space</span><h1 className="page-title">My account</h1><p>{name}</p></div>
      <CustomerLogoutButton/>
    </div>
    <div className="account-layout">
      <nav className="account-nav" aria-label="Account navigation">
        {links.map(link=><Link href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>
      <div className="account-content">{children}</div>
    </div>
  </div>;
}
