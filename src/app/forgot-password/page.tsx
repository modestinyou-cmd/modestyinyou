import {Suspense} from 'react';
import {CustomerAuthForm} from '@/components/CustomerAuthForm';
export default function ForgotPasswordPage(){return <div className="page-shell auth-shell"><Suspense fallback={<p>Loading…</p>}><CustomerAuthForm mode="forgot"/></Suspense></div>}
