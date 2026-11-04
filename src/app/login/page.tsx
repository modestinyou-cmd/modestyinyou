import {Suspense} from 'react';
import {CustomerAuthForm} from '@/components/CustomerAuthForm';
export default function LoginPage(){return <div className="page-shell auth-shell"><Suspense fallback={<p>Loading sign-in…</p>}><CustomerAuthForm mode="login"/></Suspense></div>}
