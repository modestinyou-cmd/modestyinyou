'use client';
import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';
import {createAnonClient} from '@/lib/supabase';
import {getSupabasePublishableKey,getSupabaseUrl} from '@/lib/supabase-config';

export default function AdminLogin(){
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const router=useRouter();

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd=new FormData(e.currentTarget);
    const email=String(fd.get('email')||'').trim();
    const password=String(fd.get('password')||'');

    if(!getSupabaseUrl()||!getSupabasePublishableKey()){
      setError('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable admin login.');
      setLoading(false);
      return;
    }

    const supabase=createAnonClient();
    const {data,error:authError}=await supabase.auth.signInWithPassword({email,password});
    if(authError||!data.session){
      setError(authError?.message||'Sign in failed.');
      setLoading(false);
      return;
    }

    document.cookie=`sb-access-token=${data.session.access_token};path=/;max-age=3600;samesite=strict`;

    const adminEmails=(process.env.NEXT_PUBLIC_ADMIN_EMAILS||'')
      .split(',')
      .map((adminEmail)=>adminEmail.trim().toLowerCase())
      .filter(Boolean);
    if(!data.user.email||!adminEmails.includes(data.user.email.trim().toLowerCase())){
      await supabase.auth.signOut();
      document.cookie='sb-access-token=;path=/;max-age=0';
      setError('Your account does not have administrator access.');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return(
    <div style={{maxWidth:460}}>
      <span className="eyebrow">Store administration</span>
      <h1 className="page-title">Sign in</h1>
      <p className="page-intro">Administrator access only. Provision your account through the Supabase dashboard.</p>
      <form onSubmit={submit}>
        <label className="form-field" htmlFor="email">
          Email
          <input id="email" name="email" type="email" required autoComplete="email"/>
        </label>
        <label className="form-field" htmlFor="password" style={{marginTop:12}}>
          Password
          <input id="password" name="password" type="password" required autoComplete="current-password"/>
        </label>
        <button className="button button-dark" style={{marginTop:20}} disabled={loading}>
          {loading?'Signing in…':'Sign in'}
        </button>
      </form>
      {error&&<p className="notice" role="alert" style={{marginTop:16}}>{error}</p>}
    </div>
  );
}
