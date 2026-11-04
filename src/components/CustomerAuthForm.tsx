'use client';
import {FormEvent,useState} from 'react';
import Link from 'next/link';
import {useRouter,useSearchParams} from 'next/navigation';
import {createBrowserSupabaseClient} from '@/lib/supabase-browser';
import {safeInternalPath} from '@/lib/account-path';

type AuthMode='login'|'register'|'forgot'|'password';

export function CustomerAuthForm({mode}:{mode:AuthMode}){
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const router=useRouter();
  const params=useSearchParams();
  const next=safeInternalPath(params.get('next'));

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const form=new FormData(event.currentTarget);
    const email=String(form.get('email')||'').trim().toLowerCase();

    try{
      const supabase=createBrowserSupabaseClient();
      if(mode==='login'){
        const {error:authError}=await supabase.auth.signInWithPassword({email,password:String(form.get('password')||'')});
        if(authError) throw authError;
        router.replace(next);
        router.refresh();
        return;
      }
      if(mode==='register'){
        const {data,error:authError}=await supabase.auth.signUp({
          email,
          password:String(form.get('password')||''),
          options:{
            data:{full_name:String(form.get('full_name')||'').trim()},
            emailRedirectTo:`${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if(authError) throw authError;
        if(data.session){
          router.replace(next);
          router.refresh();
          return;
        }
        setMessage('Account created. Check your email to verify your address before signing in.');
        return;
      }
      if(mode==='forgot'){
        const {error:authError}=await supabase.auth.resetPasswordForEmail(email,{
          redirectTo:`${window.location.origin}/auth/callback?next=${encodeURIComponent('/account/security?mode=reset')}`,
        });
        if(authError) throw authError;
        setMessage('If an account exists for that email, a password-reset link has been sent.');
        return;
      }
      const {error:authError}=await supabase.auth.updateUser({password:String(form.get('password')||'')});
      if(authError) throw authError;
      setMessage('Your password has been updated.');
      router.replace('/account/security');
      router.refresh();
    }catch(cause){
      setError(cause instanceof Error?cause.message:'Unable to complete this request. Please try again.');
    }finally{
      setLoading(false);
    }
  }

  async function googleSignIn(){
    setError('');
    try{
      const supabase=createBrowserSupabaseClient();
      const {error:authError}=await supabase.auth.signInWithOAuth({
        provider:'google',
        options:{redirectTo:`${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`},
      });
      if(authError) throw authError;
    }catch(cause){
      setError(cause instanceof Error?cause.message:'Google sign-in is unavailable.');
    }
  }

  const titles:Record<AuthMode,string>={login:'Welcome back',register:'Create your account',forgot:'Reset your password',password:'Choose a new password'};
  return <div className="auth-card">
    <span className="eyebrow">Modestyinyou account</span>
    <h1 className="page-title">{titles[mode]}</h1>
    <form onSubmit={submit} className="auth-form">
      {mode==='register'&&<Field name="full_name" label="Full name" autoComplete="name" required/>}
      {(mode==='login'||mode==='register'||mode==='forgot')&&<Field name="email" label="Email address" type="email" autoComplete="email" required/>}
      {(mode==='login'||mode==='register'||mode==='password')&&<Field name="password" label={mode==='password'?'New password':'Password'} type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={8} required/>}
      {mode==='register'&&<p className="auth-hint">Use at least 8 characters for your password.</p>}
      {message&&<p className="notice" role="status">{message}</p>}
      {error&&<p className="notice" role="alert">{error}</p>}
      <button className="button button-dark full" disabled={loading}>{loading?'Please waitâ€¦':mode==='login'?'Sign in':mode==='register'?'Create account':mode==='forgot'?'Send reset link':'Update password'}</button>
    </form>
    {process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED==='true'&&(mode==='login'||mode==='register')&&<button className="button button-outline full google-auth" onClick={googleSignIn} type="button">Continue with Google</button>}
    {params.get('error')==='configuration'&&<p className="notice" role="alert">Customer accounts require Supabase Auth. Configure the Supabase URL and anon key to continue.</p>}
    {params.get('error')==='verification'&&<p className="notice" role="alert">That verification or password-reset link could not be used. Request a fresh link and try again.</p>}
    <div className="auth-links">
      {mode==='login'&&<><Link href={`/forgot-password?next=${encodeURIComponent(next)}`}>Forgot password?</Link><span>New here? <Link href={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link></span></>}
      {mode==='register'&&<span>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></span>}
      {mode==='forgot'&&<Link href={`/login?next=${encodeURIComponent(next)}`}>Back to sign in</Link>}
      {mode==='password'&&<Link href="/account">Back to your account</Link>}
    </div>
  </div>;
}

function Field({name,label,type='text',autoComplete,minLength,required=false}:{name:string;label:string;type?:string;autoComplete:string;minLength?:number;required?:boolean}){
  return <label className="form-field" htmlFor={name}>{label}<input id={name} name={name} type={type} autoComplete={autoComplete} minLength={minLength} required={required}/></label>;
}

export function CustomerLogoutButton(){
  const router=useRouter();
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  async function logout(){
    setError('');
    setLoading(true);
    try{
      const supabase=createBrowserSupabaseClient();
      const {error:signOutError}=await supabase.auth.signOut();
      if(signOutError) throw signOutError;
      router.replace('/');
      router.refresh();
    }catch(cause){
      setError(cause instanceof Error?cause.message:'Unable to sign out.');
    }finally{setLoading(false);}
  }
  return <div><button className="account-logout" onClick={logout} disabled={loading}>{loading?'Signing outâ€¦':'Sign out'}</button>{error&&<span className="auth-logout-error" role="alert">{error}</span>}</div>;
}
