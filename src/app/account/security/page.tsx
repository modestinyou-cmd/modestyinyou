import {Suspense} from 'react';
import {requireCustomer} from '@/lib/account';
import {CustomerAuthForm} from '@/components/CustomerAuthForm';

export default async function SecurityPage({searchParams}:{searchParams:{mode?:string}}){
  const {user}=await requireCustomer('/account/security');
  return <>
    <div className="account-section-heading"><span className="eyebrow">Sign-in and privacy</span><h2>Security</h2><p>Signed in as {user.email}. Use a verified email address and a unique password.</p></div>
    <div className="account-panel security-panel"><h3>Password</h3><p>Request a secure password-reset link sent to your account email.</p><a className="button button-outline" href={`/forgot-password?next=${encodeURIComponent('/account/security')}`}>Send password reset link</a></div>
    {searchParams.mode==='reset'&&<Suspense fallback={null}><ResetPasswordPanel/></Suspense>}
  </>;
}

function ResetPasswordPanel(){
  return <div className="security-panel"><Suspense fallback={null}><CustomerAuthForm mode="password"/></Suspense></div>;
}
