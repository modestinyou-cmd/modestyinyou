import {Suspense} from 'react';
import {CustomerAuthForm} from '@/components/CustomerAuthForm';
export default function RegisterPage(){return <div className="page-shell auth-shell"><Suspense fallback={<p>Loading registration…</p>}><CustomerAuthForm mode="register"/></Suspense></div>}
